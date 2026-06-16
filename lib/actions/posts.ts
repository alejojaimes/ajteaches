'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Prisma, type PostType } from '@prisma/client';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { prisma } from '@/lib/db/client';
import { notifyReadersOnPostPublished } from '@/lib/email/notify';
import { getFirstContentImage, extractContentImageUrls } from '@/lib/render-post';
import { deletePostMedia, deleteCloudinaryAsset } from '@/lib/cloudinary';

const GITHUB_REPO_URL_RE =
  /^https?:\/\/github\.com\/([^/\s#?]+)\/([^/\s#?]+?)(?:\.git)?(?:[/#?].*)?$/i;

export type GithubRepoSnapshot = {
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  ownerAvatar: string | null;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function calcReadTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 225));
}

export async function createPost(): Promise<never> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) redirect('/sign-in');

  const post = await prisma.post.create({
    data: {
      title: 'Untitled',
      slug: `draft-${Date.now()}`,
      status: 'draft',
      authorId: author.id,
    },
  });

  redirect(`/write/${post.id}`);
}

export async function updatePost(
  postId: string,
  payload: {
    title: string;
    excerpt: string;
    contentJson: object;
    wordCount: number;
    tags?: string[];
    postType?: PostType;
  }
): Promise<{ ok: true }> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) throw new Error('Unauthorized');

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== author.id) throw new Error('Not found');

  const title = payload.title.trim() || 'Untitled';

  let slug = post.slug;
  if (post.status === 'draft') {
    const base = slugify(title) || `draft-${postId.slice(-8)}`;
    const existing = await prisma.post.findFirst({
      where: { slug: base, NOT: { id: postId } },
    });
    slug = existing ? `${base}-${postId.slice(-6)}` : base;
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      slug,
      excerpt: payload.excerpt.trim() || null,
      contentJson: payload.contentJson,
      readTimeMinutes: calcReadTime(payload.wordCount),
      ...(payload.postType !== undefined ? { postType: payload.postType } : {}),
      ...(payload.tags !== undefined
        ? {
            tags: {
              set: [],
              connectOrCreate: payload.tags.map((name) => ({
                where: { name },
                create: { name },
              })),
            },
          }
        : {}),
    },
  });

  if (post.status === 'published') {
    revalidatePath('/');
    revalidatePath(`/posts/${slug}`);
  }

  const assetPrefix = `/ajteaches/posts/${postId}/`;
  const oldImages = extractContentImageUrls(post.contentJson).filter((url) =>
    url.includes(assetPrefix)
  );
  const newImages = new Set(extractContentImageUrls(payload.contentJson));
  const removedImages = oldImages.filter((url) => !newImages.has(url));

  await Promise.all(
    removedImages.map((url) =>
      deleteCloudinaryAsset(url).catch((error: unknown) => {
        console.error('Failed to delete removed content image from Cloudinary', error);
      })
    )
  );

  return { ok: true };
}

export async function setCoverImage(postId: string, url: string | null): Promise<{ ok: true }> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) throw new Error('Unauthorized');

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== author.id) throw new Error('Not found');

  if (post.coverImage && post.coverImage !== url) {
    await deleteCloudinaryAsset(post.coverImage).catch((error: unknown) => {
      console.error('Failed to delete previous cover image from Cloudinary', error);
    });
  }

  await prisma.post.update({
    where: { id: postId },
    data: { coverImage: url, coverImagePosition: null },
  });

  if (post.status === 'published') {
    revalidatePath('/');
    revalidatePath(`/posts/${post.slug}`);
  }

  return { ok: true };
}

const COVER_POSITION_RE = /^\d{1,3}% \d{1,3}%$/;

export async function setCoverImagePosition(
  postId: string,
  position: string
): Promise<{ ok: true }> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) throw new Error('Unauthorized');

  if (!COVER_POSITION_RE.test(position)) throw new Error('Invalid position');

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== author.id) throw new Error('Not found');

  await prisma.post.update({ where: { id: postId }, data: { coverImagePosition: position } });

  if (post.status === 'published') {
    revalidatePath('/');
    revalidatePath(`/posts/${post.slug}`);
  }

  return { ok: true };
}

export async function setGithubRepo(
  postId: string,
  url: string
): Promise<{ ok: true; repo: GithubRepoSnapshot | null }> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) throw new Error('Unauthorized');

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== author.id) throw new Error('Not found');

  const trimmed = url.trim();
  if (!trimmed) {
    await prisma.post.update({
      where: { id: postId },
      data: { githubRepoUrl: null, githubRepoData: Prisma.DbNull },
    });
    return { ok: true, repo: null };
  }

  const match = GITHUB_REPO_URL_RE.exec(trimmed);
  if (!match)
    throw new Error('Enter a valid GitHub repository URL (https://github.com/owner/repo)');
  const [, owner, repo] = match;

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'ajteaches-bot/1.0' },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error('Repository not found or not public');

  const data = (await res.json()) as {
    full_name: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    owner: { avatar_url?: string | null } | null;
  };

  const snapshot: GithubRepoSnapshot = {
    fullName: data.full_name,
    description: data.description,
    language: data.language,
    stars: data.stargazers_count,
    ownerAvatar: data.owner?.avatar_url ?? null,
  };

  await prisma.post.update({
    where: { id: postId },
    data: {
      githubRepoUrl: `https://github.com/${owner}/${repo}`,
      githubRepoData: snapshot as unknown as Prisma.InputJsonValue,
    },
  });

  return { ok: true, repo: snapshot };
}

export async function republishPost(postId: string): Promise<void> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) redirect('/sign-in');

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== author.id || post.status !== 'published') return;

  revalidatePath('/');
  revalidatePath(`/posts/${post.slug}`);
}

export async function getTags() {
  return prisma.tag.findMany({ orderBy: { name: 'asc' } });
}

export async function searchAuthorPosts(query: string) {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) redirect('/sign-in');

  return prisma.post.findMany({
    where: {
      authorId: author.id,
      status: 'published',
      ...(query.trim() ? { title: { contains: query.trim(), mode: 'insensitive' } } : {}),
    },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: 20,
  });
}

export async function publishPost(postId: string): Promise<never> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) redirect('/sign-in');

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== author.id) throw new Error('Not found');

  const title = post.title.trim() || 'Untitled';
  const base = slugify(title) || `post-${postId.slice(-8)}`;
  const existing = await prisma.post.findFirst({
    where: { slug: base, NOT: { id: postId } },
  });
  const finalSlug = existing ? `${base}-${postId.slice(-6)}` : base;
  const isFirstPublish = post.publishedAt === null;

  await prisma.post.update({
    where: { id: postId },
    data: {
      status: 'published',
      slug: finalSlug,
      publishedAt: post.publishedAt ?? new Date(),
    },
  });

  if (isFirstPublish) {
    notifyReadersOnPostPublished({
      title,
      excerpt: post.excerpt,
      coverImage: post.coverImage ?? getFirstContentImage(post.contentJson),
      slug: finalSlug,
      author: { name: author.name },
    }).catch((error: unknown) => {
      console.error('Failed to send new post notifications', error);
    });
  }

  revalidatePath('/');
  revalidatePath(`/posts/${finalSlug}`);
  redirect(`/posts/${finalSlug}`);
}

export async function deletePost(postId: string): Promise<never> {
  const author = await getCurrentAuthor();
  if (!author || !author.isOwner) redirect('/sign-in');

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== author.id) throw new Error('Not found');

  await prisma.post.update({
    where: { id: postId },
    data: { deletedAt: new Date() },
  });

  await deletePostMedia(postId).catch((error: unknown) => {
    console.error('Failed to delete post media from Cloudinary', error);
  });

  revalidatePath('/feed');
  redirect('/feed');
}

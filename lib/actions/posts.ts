'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { prisma } from '@/lib/db/client';

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
  if (!author) redirect('/sign-in');

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
  }
): Promise<{ ok: true }> {
  const author = await getCurrentAuthor();
  if (!author) throw new Error('Unauthorized');

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

  return { ok: true };
}

export async function getTags() {
  return prisma.tag.findMany({ orderBy: { name: 'asc' } });
}

export async function publishPost(postId: string): Promise<never> {
  const author = await getCurrentAuthor();
  if (!author) redirect('/sign-in');

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== author.id) throw new Error('Not found');

  const title = post.title.trim() || 'Untitled';
  const base = slugify(title) || `post-${postId.slice(-8)}`;
  const existing = await prisma.post.findFirst({
    where: { slug: base, NOT: { id: postId } },
  });
  const finalSlug = existing ? `${base}-${postId.slice(-6)}` : base;

  await prisma.post.update({
    where: { id: postId },
    data: {
      status: 'published',
      slug: finalSlug,
      publishedAt: post.publishedAt ?? new Date(),
    },
  });

  revalidatePath('/');
  revalidatePath(`/posts/${finalSlug}`);
  redirect(`/posts/${finalSlug}`);
}

export async function deletePost(postId: string): Promise<never> {
  const author = await getCurrentAuthor();
  if (!author) redirect('/sign-in');

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== author.id) throw new Error('Not found');

  await prisma.post.update({
    where: { id: postId },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/feed');
  redirect('/feed');
}

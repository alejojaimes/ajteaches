export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getPostBySlug, getPublishedPosts } from '@/lib/db/posts';
import { getPostComments } from '@/lib/db/comments';
import { getLikeState } from '@/lib/actions/likes';
import { getCurrentReader } from '@/lib/auth/get-current-reader';
import { renderPostHTML, extractHeadings, getFirstContentImage } from '@/lib/render-post';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { CoverImage } from '@/components/blog/CoverImage';
import { getInitials } from '@/lib/utils';
import { getServerDictionary } from '@/lib/i18n/get-locale';
import type { GithubRepoSnapshot } from '@/lib/actions/posts';
import { CodeCopyInit } from '@/components/blog/CodeCopyInit';
import { ImageLightbox } from '@/components/blog/ImageLightbox';
import { ReadingTracker } from '@/components/blog/ReadingTracker';
import { LikeButton } from '@/components/blog/LikeButton';
import { CommentSection } from '@/components/blog/CommentSection';
import { GithubRepoCard } from '@/components/blog/GithubRepoCard';
import { AttachmentList } from '@/components/blog/AttachmentList';
import { SubscribePopup } from '@/components/blog/SubscribePopup';

export async function generateStaticParams() {
  const posts = await getPublishedPosts({ limit: 1000 });
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== 'published') notFound();

  const readTime = post.readTimeOverride ?? post.readTimeMinutes;
  const githubRepo =
    post.postType === 'tutorial' &&
    post.githubRepoUrl &&
    post.githubRepoData &&
    typeof post.githubRepoData === 'object'
      ? (post.githubRepoData as unknown as GithubRepoSnapshot)
      : null;

  const [{ liked, count }, comments, reader, t] = await Promise.all([
    getLikeState(post.id),
    getPostComments(post.id),
    getCurrentReader(),
    getServerDictionary(),
  ]);

  const headings = extractHeadings(post.contentJson);

  return (
    <div className="mx-auto max-w-[940px] px-4 py-12 lg:flex lg:items-start lg:gap-10">
      <article className="mx-auto w-full max-w-[700px] lg:mx-0">
        <TableOfContents headings={headings} title={t.toc.title} variant="mobile" />
        {post.postType === 'tutorial' && post.collection && (
          <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs">
            {post.collection.parent && (
              <>
                <Link
                  href={`/?type=tutorial&collection=${post.collection.parent.slug}`}
                  className="hover:text-foreground"
                >
                  {post.collection.parent.name}
                </Link>
                <span>/</span>
              </>
            )}
            <Link
              href={`/?type=tutorial&collection=${post.collection.slug}`}
              className="hover:text-foreground"
            >
              {post.collection.name}
            </Link>
          </div>
        )}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-badge bg-primary-soft text-primary px-2 py-1 text-xs font-semibold">
            {post.postType === 'tutorial' ? 'Tutorial' : 'Blog'}
          </span>
          {(post.tags ?? []).map((tag) => (
            <span
              key={tag.id}
              className="rounded-badge bg-primary-soft text-primary px-2 py-1 text-xs font-semibold"
            >
              {tag.name}
            </span>
          ))}
          <span className="text-muted-foreground text-sm">
            {readTime} min read · {post.publishedAt?.toLocaleDateString('en-US')}
          </span>
        </div>

        <h1 className="text-foreground mb-4 text-4xl leading-tight font-bold">{post.title}</h1>
        <div className="mb-8 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <Avatar size="sm">
              {post.author.avatar && (
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
              )}
              <AvatarFallback className="bg-primary text-[10px] font-bold text-white">
                {getInitials(post.author.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground text-sm">{post.author.name}</span>
          </div>
          <LikeButton postId={post.id} initialLiked={liked} initialCount={count} />
        </div>

        <div className="mb-8 overflow-hidden rounded-xl">
          <CoverImage
            src={post.coverImage ?? getFirstContentImage(post.contentJson)}
            alt={post.title}
            className="h-64 w-full object-cover md:h-80"
            position={post.coverImagePosition}
          />
        </div>

        {post.excerpt && <p className="text-muted-foreground mb-8 text-lg">{post.excerpt}</p>}

        {githubRepo && post.githubRepoUrl && (
          <GithubRepoCard url={post.githubRepoUrl} repo={githubRepo} />
        )}

        {post.postType === 'tutorial' && <AttachmentList attachments={post.attachments} />}

        {post.contentJson &&
        typeof post.contentJson === 'object' &&
        !Array.isArray(post.contentJson) ? (
          <div
            className="tiptap-editor"
            dangerouslySetInnerHTML={{ __html: renderPostHTML(post.contentJson as object) }}
          />
        ) : null}

        <CodeCopyInit />
        <ImageLightbox />
        <ReadingTracker postId={post.id} />

        <CommentSection
          postId={post.id}
          slug={post.slug}
          initialComments={comments}
          isSignedIn={!!reader}
        />
      </article>
      <aside className="hidden w-48 shrink-0 lg:block">
        <TableOfContents headings={headings} title={t.toc.title} />
      </aside>
      <SubscribePopup isSubscribed={reader?.newsletterOptIn ?? false} />
    </div>
  );
}

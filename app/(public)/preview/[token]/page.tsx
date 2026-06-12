import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/client';
import { renderPostHTML, getFirstContentImage, extractHeadings } from '@/lib/render-post';
import { CodeCopyInit } from '@/components/blog/CodeCopyInit';
import { ImageLightbox } from '@/components/blog/ImageLightbox';
import { CoverImage } from '@/components/blog/CoverImage';
import { TableOfContents } from '@/components/blog/TableOfContents';

export default async function PreviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const link = await prisma.draftShareLink.findUnique({
    where: { token },
    include: { post: { include: { author: true } } },
  });

  if (!link || link.revoked || link.expiresAt < new Date()) notFound();

  const post = link.post;
  const readTime = post.readTimeOverride ?? post.readTimeMinutes;
  const content =
    post.contentJson && typeof post.contentJson === 'object' && !Array.isArray(post.contentJson)
      ? (post.contentJson as object)
      : null;
  const headings = extractHeadings(post.contentJson);

  return (
    <div className="mx-auto max-w-[940px] px-4 py-12 lg:flex lg:items-start lg:gap-10">
      <article className="mx-auto w-full max-w-[700px] lg:mx-0">
        <TableOfContents headings={headings} title="On this page" variant="mobile" />

        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-badge bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
            Draft Preview
          </span>
          {readTime && <span className="text-muted-foreground text-sm">{readTime} min read</span>}
        </div>

        <h1 className="text-foreground mb-4 text-4xl leading-tight font-bold">
          {post.title || 'Untitled'}
        </h1>
        <div className="text-muted-foreground mb-8 text-sm">{post.author.name}</div>

        <div className="mb-8 overflow-hidden rounded-xl">
          <CoverImage
            src={post.coverImage ?? getFirstContentImage(post.contentJson)}
            alt={post.title}
            className="h-64 w-full object-cover md:h-80"
            position={post.coverImagePosition}
          />
        </div>

        {post.excerpt && <p className="text-muted-foreground mb-8 text-lg">{post.excerpt}</p>}

        {content ? (
          <div
            className="tiptap-editor"
            dangerouslySetInnerHTML={{ __html: renderPostHTML(content) }}
          />
        ) : (
          <p className="text-muted-foreground">No content yet.</p>
        )}

        <CodeCopyInit />
        <ImageLightbox />
      </article>
      <aside className="hidden w-48 shrink-0 lg:block">
        <TableOfContents headings={headings} title="On this page" />
      </aside>
    </div>
  );
}

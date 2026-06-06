import { notFound } from 'next/navigation';
import { getPostBySlug, getPublishedPosts } from '@/lib/db/posts';
import { renderPostHTML } from '@/lib/render-post';
import { CodeCopyInit } from '@/components/blog/CodeCopyInit';

export async function generateStaticParams() {
  const posts = await getPublishedPosts({ limit: 1000 });
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== 'published') notFound();

  const readTime = post.readTimeOverride ?? post.readTimeMinutes;

  return (
    <article className="mx-auto max-w-[700px] px-4 py-12">
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
      <div className="text-muted-foreground mb-8 text-sm">{post.author.name}</div>

      {post.coverImage && (
        <div className="mb-8 overflow-hidden rounded-xl">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-64 w-full object-cover md:h-80"
          />
        </div>
      )}

      {post.excerpt && <p className="text-muted-foreground mb-8 text-lg">{post.excerpt}</p>}

      {post.contentJson &&
      typeof post.contentJson === 'object' &&
      !Array.isArray(post.contentJson) ? (
        <div
          className="tiptap-editor"
          dangerouslySetInnerHTML={{ __html: renderPostHTML(post.contentJson as object) }}
        />
      ) : null}

      <CodeCopyInit />
    </article>
  );
}

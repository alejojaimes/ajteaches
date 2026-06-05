import { notFound } from 'next/navigation';
import { getPostBySlug, getPublishedPosts } from '@/lib/db/posts';

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
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-badge bg-primary-soft text-primary px-2 py-1 text-xs font-semibold">
          {post.postType === 'tutorial' ? 'Tutorial' : 'Engineering'}
        </span>
        <span className="text-muted-foreground text-sm">
          {readTime} min read · {post.publishedAt?.toLocaleDateString('en-US')}
        </span>
      </div>
      <h1 className="text-foreground mb-4 text-4xl font-bold">{post.title}</h1>
      <div className="text-muted-foreground mb-8 text-sm">{post.author.name}</div>
      {post.excerpt && <p className="text-muted-foreground mb-8 text-lg">{post.excerpt}</p>}
      <div className="prose prose-lg">
        <p>Content coming soon. Tiptap editor will be added in Phase 4.</p>
      </div>
    </article>
  );
}

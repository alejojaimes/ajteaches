import Link from 'next/link';

type Props = {
  post: {
    slug: string;
    title: string;
    excerpt: string | null;
    coverImage: string | null;
    readTimeMinutes: number;
    readTimeOverride: number | null;
    postType: string;
    author: { name: string };
    publishedAt: Date | null;
  };
};

export function PostCard({ post }: Props) {
  const readTime = post.readTimeOverride ?? post.readTimeMinutes;

  return (
    <Link href={`/posts/${post.slug}`} className="block">
      <article className="rounded-card border-border bg-card border p-6 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-badge bg-primary-soft text-primary px-2 py-1 text-xs font-semibold">
            {post.postType === 'tutorial' ? 'Tutorial' : 'Engineering'}
          </span>
          <span className="text-muted-foreground text-xs">{readTime} min read</span>
        </div>
        <h2 className="text-foreground mb-2 text-xl font-bold">{post.title}</h2>
        {post.excerpt && <p className="text-muted-foreground text-sm">{post.excerpt}</p>}
        <div className="text-muted-foreground mt-4 text-xs">
          {post.author.name} · {post.publishedAt?.toLocaleDateString('en-US')}
        </div>
      </article>
    </Link>
  );
}

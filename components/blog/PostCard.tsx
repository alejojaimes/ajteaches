import Link from 'next/link';
import { BookmarkButton } from './BookmarkButton';

type Props = {
  post: {
    slug: string;
    title: string;
    excerpt: string | null;
    coverImage: string | null;
    readTimeMinutes: number;
    readTimeOverride: number | null;
    postType: string;
    author: { name: string; avatar: string | null };
    publishedAt: Date | null;
    tags?: { id: string; name: string }[];
  };
};

export function PostCard({ post }: Props) {
  const readTime = post.readTimeOverride ?? post.readTimeMinutes;

  return (
    <Link href={`/posts/${post.slug}`} className="block">
      <article className="rounded-card border-border bg-card border p-6 transition hover:-translate-y-0.5 hover:shadow-md">
        {/* Top row: badges + bookmark */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            {(post.tags ?? []).length > 0 ? (
              (post.tags ?? []).map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-badge bg-primary-soft text-primary px-2 py-1 text-xs font-semibold"
                >
                  {tag.name}
                </span>
              ))
            ) : (
              <span className="rounded-badge bg-primary-soft text-primary px-2 py-1 text-xs font-semibold">
                {post.postType === 'tutorial' ? 'Tutorial' : 'Blog'}
              </span>
            )}
          </div>
          <BookmarkButton slug={post.slug} />
        </div>

        {/* Content row: text + optional thumbnail */}
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-foreground mb-2 line-clamp-2 text-lg font-bold">{post.title}</h2>
            {post.excerpt && (
              <p className="text-muted-foreground line-clamp-2 text-sm">{post.excerpt}</p>
            )}
          </div>

          {post.coverImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={post.coverImage}
              alt=""
              className="h-[60px] w-20 flex-shrink-0 rounded-md object-cover"
            />
          )}
        </div>

        {/* Bottom row: author · date · read time */}
        <div className="text-muted-foreground mt-4 text-xs">
          {post.author.name} · {post.publishedAt?.toLocaleDateString('en-US')} · {readTime} min read
        </div>
      </article>
    </Link>
  );
}

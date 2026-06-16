import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { BookmarkButton } from './BookmarkButton';
import { CoverImage } from './CoverImage';

const cardDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

type Props = {
  post: {
    id: string;
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
    collection?: { name: string; slug: string } | null;
    viewCount?: number;
    likeCount?: number;
    commentCount?: number;
  };
  initialSaved?: boolean;
};

export function PostCard({ post, initialSaved = false }: Props) {
  const readTime = post.readTimeOverride ?? post.readTimeMinutes;
  const hasStats =
    (post.viewCount ?? 0) > 0 || (post.likeCount ?? 0) > 0 || (post.commentCount ?? 0) > 0;

  return (
    <Link href={`/posts/${post.slug}`} className="block">
      <article className="rounded-card border-border bg-card border p-6 transition hover:-translate-y-0.5 hover:shadow-md">
        {/* Top row: badges + bookmark */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            {post.collection && (
              <span className="rounded-badge bg-accent/10 text-accent px-2 py-1 text-xs font-semibold">
                {post.collection.name}
              </span>
            )}
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
          <BookmarkButton postId={post.id} initialSaved={initialSaved} />
        </div>

        {/* Content row: text + optional thumbnail */}
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-foreground mb-2 line-clamp-2 text-lg font-bold">{post.title}</h2>
            {post.excerpt && (
              <p className="text-muted-foreground line-clamp-2 text-sm">{post.excerpt}</p>
            )}
          </div>

          <CoverImage
            src={post.coverImage}
            alt=""
            compact
            className="h-[60px] w-20 flex-shrink-0 rounded-md object-cover"
          />
        </div>

        {/* Bottom row: author avatar + name, formatted date, read time */}
        <div className="mt-4 flex items-center gap-2.5">
          <Avatar size="sm">
            {post.author.avatar && <AvatarImage src={post.author.avatar} alt={post.author.name} />}
            <AvatarFallback className="text-[10px]">{getInitials(post.author.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-foreground truncate text-xs font-medium">{post.author.name}</p>
            <p className="text-muted-foreground text-xs">
              {post.publishedAt && cardDateFormatter.format(post.publishedAt)} · Takes {readTime}{' '}
              min to read
            </p>
          </div>
        </div>

        {/* Stats row: views, likes, comments */}
        {hasStats && (
          <div className="text-muted-foreground border-border mt-3 flex items-center gap-3 border-t pt-3 text-xs">
            {(post.viewCount ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {post.viewCount}
              </span>
            )}
            {(post.likeCount ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {post.likeCount}
              </span>
            )}
            {(post.commentCount ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {post.commentCount}
              </span>
            )}
          </div>
        )}
      </article>
    </Link>
  );
}

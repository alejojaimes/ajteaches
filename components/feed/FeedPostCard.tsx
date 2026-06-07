import Link from 'next/link';
import { Eye, Clock } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DeletePostButton } from '@/components/editor/DeletePostButton';
import { formatRelativeTime } from '@/lib/utils';
import type { OwnerPostListItem } from '@/lib/db/posts';

type Props = {
  post: OwnerPostListItem;
  author: { name: string; avatar: string | null };
  onDelete: () => Promise<void>;
};

export function FeedPostCard({ post, author, onDelete }: Props) {
  const readTime = post.readTimeOverride ?? post.readTimeMinutes;
  const isDraft = post.status === 'draft';
  const dateLabel = isDraft
    ? `Last edited ${formatRelativeTime(post.updatedAt)}`
    : (post.publishedAt?.toLocaleDateString('en-US') ?? '');

  return (
    <article className="rounded-card border-border bg-card border p-5 transition-shadow duration-150 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {isDraft ? (
              <span className="rounded-badge bg-primary-soft text-primary px-2 py-1 text-xs font-semibold">
                Draft
              </span>
            ) : post.tags.length > 0 ? (
              post.tags.map((tag) => (
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

          <h3 className="text-foreground mb-1 text-lg font-bold">{post.title}</h3>
          {post.excerpt && (
            <p className="text-muted-foreground line-clamp-2 text-sm">{post.excerpt}</p>
          )}

          <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
            <span className="flex items-center gap-1.5">
              <Avatar size="sm">
                {author.avatar && <AvatarImage src={author.avatar} alt={author.name} />}
                <AvatarFallback className="bg-primary text-[10px] font-bold text-white">
                  aj
                </AvatarFallback>
              </Avatar>
              {author.name}
            </span>
            <span>·</span>
            <span>{dateLabel}</span>
            {!isDraft && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {post.views.toLocaleString('en-US')}
                </span>
              </>
            )}
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {readTime} min read
            </span>
          </div>
        </div>

        {post.coverImage && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={post.coverImage}
            alt=""
            className="h-20 w-28 flex-shrink-0 rounded-lg object-cover"
          />
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link
          href={`/write/${post.id}`}
          className="rounded-button border-border text-muted-foreground hover:border-primary hover:text-primary inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:scale-[1.03]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Edit
        </Link>
        <DeletePostButton deleteAction={onDelete} postTitle={post.title} />
      </div>
    </article>
  );
}

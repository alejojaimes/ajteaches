import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAuthor } from '@/lib/auth/get-current-author';
import { getAllCommentsForModeration } from '@/lib/db/comments';
import { deleteComment } from '@/lib/actions/comments';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DeleteCommentButton } from '@/components/comments/DeleteCommentButton';
import { formatRelativeTime } from '@/lib/utils';

export default async function CommentsPage() {
  const author = await getCurrentAuthor();
  if (!author) redirect('/sign-in');

  const comments = await getAllCommentsForModeration();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-foreground text-3xl font-bold">Comments</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Moderate comments left by readers across your posts.
        </p>
      </header>

      {comments.length === 0 ? (
        <p className="text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => {
            async function del() {
              'use server';
              await deleteComment(comment.id);
            }
            return (
              <li key={comment.id} className="rounded-card border-border bg-card border p-4">
                <div className="flex items-start gap-3">
                  <Avatar size="sm">
                    {comment.reader.avatar && (
                      <AvatarImage src={comment.reader.avatar} alt={comment.reader.name} />
                    )}
                    <AvatarFallback>{comment.reader.name.slice(0, 2).toLowerCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-foreground text-sm font-medium">
                        {comment.reader.name}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      on{' '}
                      <Link
                        href={`/posts/${comment.post.slug}`}
                        className="text-primary hover:text-primary-hover font-medium"
                      >
                        {comment.post.title}
                      </Link>
                    </p>
                    <p className="text-foreground mt-2 text-sm whitespace-pre-wrap">
                      {comment.body}
                    </p>
                  </div>
                  <DeleteCommentButton deleteAction={del} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatRelativeTime } from '@/lib/utils';
import { createComment } from '@/lib/actions/comments';

export type CommentItem = {
  id: string;
  body: string;
  createdAt: Date;
  reader: { id: string; name: string; avatar: string | null };
};

type Props = {
  postId: string;
  slug: string;
  initialComments: CommentItem[];
  isSignedIn: boolean;
};

const textareaClass =
  'border-border bg-background text-foreground w-full rounded-button border px-3 py-2 text-sm focus:border-primary focus:outline-none';

export function CommentSection({ postId, slug, initialComments, isSignedIn }: Props) {
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (posting) return;

    const trimmed = body.trim();
    if (!trimmed) return;

    setPosting(true);
    try {
      await createComment({ postId, slug, body: trimmed });
      setBody('');
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="mt-12">
      <h2 className="text-foreground mb-4 text-xl font-bold">
        Comments ({initialComments.length})
      </h2>

      {initialComments.length > 0 && (
        <ul className="space-y-5">
          {initialComments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <Avatar size="sm">
                {comment.reader.avatar && (
                  <AvatarImage src={comment.reader.avatar} alt={comment.reader.name} />
                )}
                <AvatarFallback>{comment.reader.name.slice(0, 2).toLowerCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-foreground text-sm font-medium">{comment.reader.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-foreground mt-1 text-sm whitespace-pre-wrap">{comment.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        {isSignedIn ? (
          <form onSubmit={(e) => void handleSubmit(e)}>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add a comment…"
              rows={3}
              required
              className={textareaClass}
            />
            <div className="mt-3">
              <button
                type="submit"
                disabled={posting || !body.trim()}
                className="rounded-button bg-primary hover:bg-primary-hover px-5 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60"
              >
                {posting ? 'Posting…' : 'Post comment'}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-muted-foreground text-sm">
            <Link href="/sign-in" className="text-primary hover:text-primary-hover font-medium">
              Sign in
            </Link>{' '}
            to comment
          </p>
        )}
      </div>
    </section>
  );
}

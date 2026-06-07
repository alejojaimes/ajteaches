'use client';

import { useEffect, useState } from 'react';
import { searchAuthorPosts } from '@/lib/actions/posts';

export type FeaturedPostOption = {
  slug: string;
  title: string;
  coverImage: string | null;
  publishedAt: Date | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (post: FeaturedPostOption) => void;
};

export function FeaturedPostPicker({ open, onClose, onSelect }: Props) {
  if (!open) return null;
  return <FeaturedPostPickerDialog onClose={onClose} onSelect={onSelect} />;
}

function FeaturedPostPickerDialog({ onClose, onSelect }: Pick<Props, 'onClose' | 'onSelect'>) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FeaturedPostOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      void searchAuthorPosts(query).then((posts) => {
        if (!active) return;
        setResults(posts);
        setLoading(false);
      });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="border-border bg-card mx-4 flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl border p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-foreground mb-3 text-base font-semibold">Choose featured post</h3>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setLoading(true);
          }}
          placeholder="Search by title…"
          autoFocus
          className="border-border bg-background text-foreground rounded-button focus:border-primary w-full border px-3 py-2 text-sm focus:outline-none"
        />
        <div className="mt-3 min-h-[120px] flex-1 space-y-1 overflow-y-auto">
          {loading && <p className="text-muted-foreground py-8 text-center text-sm">Searching…</p>}
          {!loading && results.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">No posts found.</p>
          )}
          {!loading &&
            results.map((post) => (
              <button
                key={post.slug}
                type="button"
                onClick={() => {
                  onSelect(post);
                  onClose();
                }}
                className="group hover:bg-primary-soft rounded-button flex w-full items-center gap-3 px-3 py-2 text-left transition-colors"
              >
                {post.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImage}
                    alt=""
                    className="h-10 w-14 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="bg-primary-soft h-10 w-14 shrink-0 rounded-md" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-foreground group-hover:text-primary truncate text-sm font-medium">
                    {post.title}
                  </p>
                  {post.publishedAt && (
                    <p className="text-muted-foreground text-xs">
                      {post.publishedAt.toLocaleDateString('en-US')}
                    </p>
                  )}
                </div>
              </button>
            ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground mt-4 self-end text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

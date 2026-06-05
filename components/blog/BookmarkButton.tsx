'use client';

import { useState } from 'react';

type Props = {
  slug: string;
};

function isBookmarked(slug: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem('bookmarks');
    if (!stored) return false;
    const bookmarks: string[] = JSON.parse(stored);
    return bookmarks.includes(slug);
  } catch {
    return false;
  }
}

export function BookmarkButton({ slug }: Props) {
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(slug));

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    try {
      const stored = localStorage.getItem('bookmarks');
      const bookmarks: string[] = stored ? JSON.parse(stored) : [];

      const updated = bookmarks.includes(slug)
        ? bookmarks.filter((s) => s !== slug)
        : [...bookmarks, slug];

      localStorage.setItem('bookmarks', JSON.stringify(updated));
      setBookmarked(updated.includes(slug));
    } catch {
      // localStorage unavailable; silently ignore
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={bookmarked ? 'Remove bookmark' : 'Save bookmark'}
      className="text-muted-foreground hover:text-primary transition-colors"
    >
      {bookmarked ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-primary h-5 w-5"
        >
          <path d="M6 3a2 2 0 0 0-2 2v16l8-4 8 4V5a2 2 0 0 0-2-2H6Z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z" />
        </svg>
      )}
    </button>
  );
}

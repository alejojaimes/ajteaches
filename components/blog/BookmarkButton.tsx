'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toggleSave } from '@/lib/actions/saves';

type Props = {
  postId: string;
  initialSaved: boolean;
};

export function BookmarkButton({ postId, initialSaved }: Props) {
  const [saved, setSaved] = useState(initialSaved);
  const router = useRouter();
  const pathname = usePathname();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const nextSaved = !saved;
    setSaved(nextSaved);

    toggleSave(postId).then((result) => {
      if ('requiresAuth' in result) {
        setSaved(initialSaved);
        router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
        return;
      }
      setSaved(result.saved);
    });
  }

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? 'Remove from saved posts' : 'Save this post'}
      className="text-muted-foreground hover:text-primary transition-colors"
    >
      {saved ? (
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

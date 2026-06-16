'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toggleLike } from '@/lib/actions/likes';

type Props = {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
};

export function LikeButton({ postId, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [burst, setBurst] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    if (nextLiked) {
      setBurst(true);
      setTimeout(() => setBurst(false), 600);
    }

    void toggleLike(postId).then((result) => {
      if ('requiresAuth' in result) {
        setLiked(initialLiked);
        setCount(initialCount);
        setBurst(false);
        router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
        return;
      }
      setLiked(result.liked);
      setCount(result.count);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={liked ? 'Unlike this post' : 'Like this post'}
      className="flex items-center gap-1.5"
    >
      <span className="relative flex items-center justify-center">
        {burst && (
          <span className="animate-like-burst absolute inset-0 rounded-full border-2 border-red-400" />
        )}
        <svg
          viewBox="0 0 24 24"
          className={`h-5 w-5 transition-colors duration-150 ${
            liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'
          } ${burst ? 'animate-heart-pop' : ''}`}
          fill={liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </span>
      <span
        className={`text-sm transition-colors duration-150 ${
          liked ? 'text-red-500' : 'text-muted-foreground'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

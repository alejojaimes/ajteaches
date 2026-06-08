'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Heart } from 'lucide-react';
import { toggleLike } from '@/lib/actions/likes';

type Props = {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
};

export function LikeButton({ postId, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const router = useRouter();
  const pathname = usePathname();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    toggleLike(postId).then((result) => {
      if ('requiresAuth' in result) {
        setLiked(initialLiked);
        setCount(initialCount);
        router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
        return;
      }
      setLiked(result.liked);
      setCount(result.count);
    });
  }

  return (
    <button
      onClick={handleClick}
      aria-label={liked ? 'Unlike this post' : 'Like this post'}
      className="text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
    >
      <Heart
        className={liked ? 'h-5 w-5 text-red-500' : 'h-5 w-5'}
        fill={liked ? 'currentColor' : 'none'}
      />
      <span className="text-sm">{count}</span>
    </button>
  );
}

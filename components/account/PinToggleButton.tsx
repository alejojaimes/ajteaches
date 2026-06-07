'use client';

import { Pin } from 'lucide-react';

type Props = {
  pinned: boolean;
  pinAction: () => Promise<void>;
};

export function PinToggleButton({ pinned, pinAction }: Props) {
  return (
    <button
      type="button"
      onClick={() => void pinAction()}
      aria-label={pinned ? 'Unpin this post' : 'Pin this post'}
      title={pinned ? 'Unpin this post' : 'Pin this post'}
      className={
        pinned
          ? 'text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded transition-colors'
          : 'text-muted-foreground hover:text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded transition-colors'
      }
    >
      <Pin className="h-4 w-4" fill={pinned ? 'currentColor' : 'none'} />
    </button>
  );
}

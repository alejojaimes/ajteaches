'use client';

import { X } from 'lucide-react';

type Props = {
  removeAction: () => Promise<void>;
};

export function RemoveSaveButton({ removeAction }: Props) {
  return (
    <button
      type="button"
      onClick={() => void removeAction()}
      aria-label="Remove from saved posts"
      title="Remove from saved posts"
      className="text-muted-foreground hover:text-destructive flex h-7 w-7 shrink-0 items-center justify-center rounded transition-colors"
    >
      <X className="h-4 w-4" />
    </button>
  );
}

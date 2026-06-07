'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type Props = {
  deleteAction: () => Promise<void>;
};

export function DeleteCommentButton({ deleteAction }: Props) {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    setOpen(false);
    await deleteAction();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Delete comment"
        className="text-muted-foreground hover:text-destructive flex h-7 w-7 shrink-0 items-center justify-center rounded transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>

      <ConfirmDialog
        open={open}
        title="Delete this comment?"
        message="This comment will be hidden and cannot be recovered."
        confirmLabel="Delete"
        cancelLabel="Keep it"
        variant="danger"
        onConfirm={() => void handleConfirm()}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

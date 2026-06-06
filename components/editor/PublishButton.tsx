'use client';

import { useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type Props = {
  action: () => Promise<void>;
  isPublished: boolean;
};

export function PublishButton({ action, isPublished }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    setOpen(false);
    formRef.current?.requestSubmit();
  };

  return (
    <>
      <form ref={formRef} action={action} />
      <button
        type="button"
        onClick={() => !isPublished && setOpen(true)}
        disabled={isPublished}
        className="rounded-button bg-primary hover:bg-primary-hover px-4 py-1.5 text-sm font-medium text-white disabled:cursor-default disabled:opacity-50"
      >
        {isPublished ? 'Published' : 'Publish'}
      </button>

      <ConfirmDialog
        open={open}
        title="Publish this post?"
        message="The slug will be frozen and cannot be changed after publishing. Make sure the title is final."
        confirmLabel="Publish"
        cancelLabel="Not yet"
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

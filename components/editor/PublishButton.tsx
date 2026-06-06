'use client';

import { useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type Props = {
  action: () => Promise<void>;
  updateAction?: () => Promise<void>;
  isPublished: boolean;
};

export function PublishButton({ action, updateAction, isPublished }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [updated, setUpdated] = useState(false);

  const handlePublishConfirm = () => {
    setOpen(false);
    formRef.current?.requestSubmit();
  };

  const handleUpdateConfirm = async () => {
    setOpen(false);
    await updateAction?.();
    setUpdated(true);
    setTimeout(() => setUpdated(false), 2000);
  };

  if (isPublished) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`rounded-button px-4 py-1.5 text-sm font-medium text-white transition-all ${
            updated ? 'cursor-default bg-emerald-500' : 'bg-primary hover:bg-primary-hover'
          }`}
        >
          {updated ? '✓ Updated' : 'Update'}
        </button>

        <ConfirmDialog
          open={open}
          title="Push latest edits live?"
          message="Your saved changes will be visible on the published post immediately."
          confirmLabel="Push live"
          cancelLabel="Cancel"
          onConfirm={() => void handleUpdateConfirm()}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <form ref={formRef} action={action} />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-button bg-primary hover:bg-primary-hover px-4 py-1.5 text-sm font-medium text-white"
      >
        Publish
      </button>

      <ConfirmDialog
        open={open}
        title="Publish this post?"
        message="The slug will be frozen and cannot be changed after publishing. Make sure the title is final."
        confirmLabel="Publish"
        cancelLabel="Not yet"
        onConfirm={handlePublishConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

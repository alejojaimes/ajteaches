'use client';

import { useRef } from 'react';

type Props = {
  action: () => Promise<void>;
  isPublished: boolean;
};

export function PublishButton({ action, isPublished }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleClick = () => {
    if (isPublished) return;
    const ok = confirm(
      'Publish this post? The slug will be frozen and cannot be changed after publishing.'
    );
    if (ok) formRef.current?.requestSubmit();
  };

  return (
    <form ref={formRef} action={action}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPublished}
        className="rounded-button bg-primary hover:bg-primary-hover px-4 py-1.5 text-sm font-medium text-white disabled:cursor-default disabled:opacity-50"
      >
        {isPublished ? 'Published' : 'Publish'}
      </button>
    </form>
  );
}

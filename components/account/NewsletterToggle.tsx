'use client';

import { useState } from 'react';
import { setNewsletterOptIn } from '@/lib/actions/readers';

type Props = {
  initialOptedIn: boolean;
};

export function NewsletterToggle({ initialOptedIn }: Props) {
  const [optedIn, setOptedIn] = useState(initialOptedIn);
  const [saving, setSaving] = useState(false);

  const handleToggle = async () => {
    if (saving) return;
    const next = !optedIn;
    setOptedIn(next);
    setSaving(true);
    try {
      const result = await setNewsletterOptIn(next);
      if ('requiresAuth' in result) {
        setOptedIn(!next);
        return;
      }
      setOptedIn(result.optedIn);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-border bg-card mb-8 flex items-center justify-between gap-3 rounded-xl border p-4">
      <div>
        <p className="text-foreground text-sm font-semibold">Newsletter</p>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {optedIn
            ? "You're subscribed to weekly updates."
            : 'Get a weekly summary of new posts and tutorials.'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => void handleToggle()}
        disabled={saving}
        className={`rounded-button shrink-0 px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
          optedIn
            ? 'border-border text-foreground hover:bg-muted border'
            : 'bg-primary hover:bg-primary-hover text-white'
        }`}
      >
        {optedIn ? 'Unsubscribe' : 'Subscribe'}
      </button>
    </div>
  );
}

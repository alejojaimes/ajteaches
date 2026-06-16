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
    <div className="border-border bg-card relative mb-8 overflow-hidden rounded-2xl border p-6">
      <div className="flex items-start gap-5">
        <div className="bg-primary/10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
          {optedIn ? (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              className="text-primary"
              aria-hidden="true"
            >
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.73 21a2 2 0 0 1-3.46 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 8.5l2 2 4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              className="bell-ring text-primary"
              aria-hidden="true"
            >
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.73 21a2 2 0 0 1-3.46 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {optedIn ? (
            <>
              <p className="text-foreground text-base font-semibold">You&apos;re subscribed</p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                You&apos;ll get weekly updates on new posts and tutorials.
              </p>
            </>
          ) : (
            <>
              <p className="text-foreground text-base font-semibold">Stay in the loop</p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Get a weekly digest of new posts, tutorials, and engineering notes — straight to
                your inbox.
              </p>
            </>
          )}

          <div className="mt-4">
            {optedIn ? (
              <button
                type="button"
                onClick={() => void handleToggle()}
                disabled={saving}
                className="border-border text-muted-foreground hover:text-foreground rounded-button border px-4 py-1.5 text-xs font-medium transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Unsubscribe'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleToggle()}
                disabled={saving}
                className="bg-primary hover:bg-primary-hover rounded-button px-5 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60"
              >
                {saving ? 'Subscribing…' : 'Subscribe'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

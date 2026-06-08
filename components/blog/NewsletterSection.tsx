'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { setNewsletterOptIn } from '@/lib/actions/readers';

type Props = {
  reader: { newsletterOptIn: boolean } | null;
};

export function NewsletterSection({ reader }: Props) {
  const [optedIn, setOptedIn] = useState(reader?.newsletterOptIn ?? false);
  const [saving, setSaving] = useState(false);
  const pathname = usePathname();

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
    <section className="bg-primary rounded-2xl px-8 py-12 text-white">
      <h2 className="mb-2 text-2xl font-bold">Level up your engineering skills</h2>
      <p className="mb-8 max-w-lg text-white/80">
        Get a weekly summary of technical deep dives and career advice delivered straight to your
        inbox.
      </p>

      {reader ? (
        <button
          type="button"
          onClick={() => void handleToggle()}
          disabled={saving}
          className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
        >
          {optedIn ? '✓ Subscribed — click to unsubscribe' : 'Subscribe to the newsletter'}
        </button>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-white/80">Create a free account to subscribe.</p>
          <Link
            href={`/sign-up?redirect_url=${encodeURIComponent(pathname)}`}
            className="rounded-lg bg-gray-900 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Sign up
          </Link>
        </div>
      )}
    </section>
  );
}

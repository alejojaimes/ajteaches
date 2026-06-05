'use client';

import { useState } from 'react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');

  return (
    <section className="bg-primary rounded-2xl px-8 py-12 text-white">
      <h2 className="mb-2 text-2xl font-bold">Level up your engineering skills</h2>
      <p className="mb-8 max-w-lg text-white/80">
        Get a weekly summary of technical deep dives and career advice delivered straight to your
        inbox.
      </p>
      <form
        action="/api/subscribe"
        method="POST"
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="senior@engineer.com"
          required
          className="w-full rounded-lg bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none sm:max-w-xs"
        />
        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Subscribe
        </button>
      </form>
    </section>
  );
}

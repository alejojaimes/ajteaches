'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = 'subscribe_dismissed_at';
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const TRIGGER_DELAY_MS = 5000;
const SCROLL_THRESHOLD = 0.4;

type Props = {
  isSubscribed: boolean;
};

export function SubscribePopup({ isSubscribed }: Props) {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isSubscribed) return;

    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_TTL_MS) return;

    let triggered = false;

    const trigger = () => {
      if (triggered) return;
      triggered = true;
      setVisible(true);
      requestAnimationFrame(() => setAnimateIn(true));
    };

    const timer = setTimeout(trigger, TRIGGER_DELAY_MS);

    const onScroll = () => {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrolled >= SCROLL_THRESHOLD) trigger();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [isSubscribed]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setAnimateIn(false);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed right-6 bottom-6 z-50 w-80 transition-all duration-300 ease-out ${
        animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <div className="border-border bg-card rounded-2xl border p-5 shadow-xl">
        <button
          type="button"
          onClick={dismiss}
          className="text-muted-foreground hover:text-foreground absolute top-3 right-3 leading-none transition-colors"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="mb-3 flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <svg
              width="20"
              height="20"
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
          </div>
          <p className="text-foreground text-sm leading-snug font-semibold">
            Suscríbete al newsletter
          </p>
        </div>

        <p className="text-muted-foreground mb-4 text-xs leading-relaxed">
          Posts de ingeniería, tutoriales y notas reales — directo a tu correo, sin spam.
        </p>

        <div className="flex gap-2">
          <Link
            href={`/sign-up?redirect_url=${encodeURIComponent(pathname)}`}
            onClick={dismiss}
            className="bg-primary hover:bg-primary-hover rounded-button flex-1 py-2 text-center text-xs font-semibold text-white transition-colors"
          >
            Crear cuenta gratis
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="border-border text-muted-foreground hover:text-foreground rounded-button border px-3 py-2 text-xs transition-colors"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}

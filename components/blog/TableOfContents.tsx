'use client';

import { useEffect, useRef, useState } from 'react';
import { ListTree, X } from 'lucide-react';
import type { Heading } from '@/lib/render-post';

type Props = {
  headings: Heading[];
  title: string;
  variant?: 'sidebar' | 'mobile';
  openLabel?: string;
};

function useActiveHeading(headings: Heading[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-100px 0px -70% 0px' }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  return activeId;
}

function HeadingList({
  headings,
  activeId,
  onNavigate,
  activeItemRef,
}: {
  headings: Heading[];
  activeId: string | null;
  onNavigate?: () => void;
  activeItemRef?: React.RefObject<HTMLAnchorElement | null>;
}) {
  return (
    <ul className="space-y-1.5 text-sm">
      {headings.map((heading) => {
        const isActive = activeId === heading.id;
        return (
          <li key={heading.id} className={heading.level === 3 ? 'pl-3' : undefined}>
            <a
              ref={isActive ? activeItemRef : undefined}
              href={`#${heading.id}`}
              onClick={onNavigate}
              className={`block truncate transition-colors ${
                isActive
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function MobileTocSheet({
  headings,
  title,
  openLabel,
  activeId,
}: {
  headings: Heading[];
  title: string;
  openLabel: string;
  activeId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = 'hidden';
    activeItemRef.current?.scrollIntoView({ block: 'center' });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={openLabel}
        onClick={() => setOpen(true)}
        className="bg-primary hover:bg-primary-hover fixed top-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-colors"
      >
        <ListTree className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="border-border bg-card animate-in slide-in-from-bottom max-h-[75vh] w-full overflow-y-auto rounded-t-2xl border-t p-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-foreground text-sm font-semibold">{title}</p>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <HeadingList
              headings={headings}
              activeId={activeId}
              onNavigate={() => setOpen(false)}
              activeItemRef={activeItemRef}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function TableOfContents({ headings, title, variant = 'sidebar', openLabel }: Props) {
  const activeId = useActiveHeading(headings);

  if (headings.length === 0) return null;

  if (variant === 'mobile') {
    return (
      <MobileTocSheet
        headings={headings}
        title={title}
        openLabel={openLabel ?? title}
        activeId={activeId}
      />
    );
  }

  return (
    <nav className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto lg:block">
      <p className="text-foreground mb-3 text-sm font-semibold">{title}</p>
      <HeadingList headings={headings} activeId={activeId} />
    </nav>
  );
}

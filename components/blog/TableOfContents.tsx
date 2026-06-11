'use client';

import { useEffect, useState } from 'react';
import type { Heading } from '@/lib/render-post';

type Props = {
  headings: Heading[];
  title: string;
  variant?: 'sidebar' | 'mobile';
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

export function TableOfContents({ headings, title, variant = 'sidebar' }: Props) {
  const activeId = useActiveHeading(headings);

  if (headings.length === 0) return null;

  const list = (
    <ul className="space-y-1.5 text-sm">
      {headings.map((heading) => (
        <li key={heading.id} className={heading.level === 3 ? 'pl-3' : undefined}>
          <a
            href={`#${heading.id}`}
            className={`block truncate transition-colors ${
              activeId === heading.id
                ? 'text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  );

  if (variant === 'mobile') {
    return (
      <details className="border-border bg-card rounded-card mb-8 border p-4 lg:hidden">
        <summary className="text-foreground cursor-pointer text-sm font-semibold">{title}</summary>
        <div className="mt-3">{list}</div>
      </details>
    );
  }

  return (
    <nav className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto lg:block">
      <p className="text-foreground mb-3 text-sm font-semibold">{title}</p>
      {list}
    </nav>
  );
}

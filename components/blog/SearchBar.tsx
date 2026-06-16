'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function SearchBar({ initialQuery = '' }: { initialQuery?: string }) {
  const [value, setValue] = useState(initialQuery);
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pushQuery = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) {
        params.set('q', q);
      } else {
        params.delete('q');
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setValue(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushQuery(q), 300);
  };

  const handleClear = () => {
    setValue('');
    pushQuery('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="relative mx-auto mb-8 w-full max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="text-muted-foreground"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Buscar posts, tutoriales, tags…"
        className="border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 w-full rounded-xl border py-2.5 pr-9 pl-9 text-sm transition-all outline-none focus:ring-2"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-3 flex items-center transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M18 6 6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

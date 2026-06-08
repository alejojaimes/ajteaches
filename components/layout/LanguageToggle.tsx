'use client';

import { useTranslations } from '@/lib/i18n/LocaleProvider';

export function LanguageToggle() {
  const { locale, setLocale } = useTranslations();
  const next = locale === 'es' ? 'en' : 'es';

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={`Switch language to ${next === 'es' ? 'Spanish' : 'English'}`}
      className="text-muted-foreground hover:text-foreground hover:bg-muted flex h-9 items-center justify-center rounded-full px-3 text-xs font-semibold tracking-wide uppercase transition-colors"
    >
      {locale}
    </button>
  );
}

import { cookies } from 'next/headers';
import { LOCALE_COOKIE, DEFAULT_LOCALE, isLocale, dictionaries, type Locale } from './dictionaries';

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
}

export async function getServerDictionary() {
  const locale = await getServerLocale();
  return dictionaries[locale];
}

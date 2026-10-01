import type { Locale } from '@/lib/domain/learner-intake';

export function htmlLangForLocale(locale: Locale): string {
  return locale === 'en' ? 'en' : 'zh-CN';
}

export function withLocaleQuery(
  search: string | URLSearchParams,
  locale: Locale,
): string {
  const raw = typeof search === 'string' ? search.replace(/^\?/, '') : search;
  const params = new URLSearchParams(raw);
  params.set('locale', locale);
  return params.toString();
}

export function buildLocaleUrl(
  pathname: string,
  search: string | URLSearchParams,
  locale: Locale,
): string {
  const query = withLocaleQuery(search, locale);
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return query ? `${path}?${query}` : path;
}

export function applyLocaleDocument(locale: Locale): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.lang = htmlLangForLocale(locale);
}

export function syncLocaleToUrl(locale: Locale): void {
  if (typeof window === 'undefined') {
    return;
  }
  const url = buildLocaleUrl(
    window.location.pathname,
    window.location.search,
    locale,
  );
  window.history.replaceState(null, '', url);
  applyLocaleDocument(locale);
}

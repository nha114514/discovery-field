import { HomeClient } from '@/components/home-client';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawLocale = params.locale;
  const locale = Array.isArray(rawLocale)
    ? (rawLocale[0] ?? '')
    : (rawLocale ?? '');

  return <HomeClient initialLocale={locale} />;
}

import { TopicExplorer } from '@/components/topic-explorer';

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{
    goal?: string | string[];
    locale?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const rawGoal = params.goal;
  const rawLocale = params.locale;
  const goal = Array.isArray(rawGoal) ? (rawGoal[0] ?? '') : (rawGoal ?? '');
  const locale = Array.isArray(rawLocale)
    ? (rawLocale[0] ?? '')
    : (rawLocale ?? '');

  return <TopicExplorer goal={goal.trim()} initialLocale={locale} />;
}

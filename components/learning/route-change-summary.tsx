import type { Level } from '../../lib/domain/learner-intake';
import type { EntryCopy } from '../../lib/i18n/copy';

export interface AdaptiveExplainerProps {
  evidenceSource: 'quick-quiz' | 'open-answer';
  stableLevelBefore: Level;
  stableLevelAfter: Level;
  pendingLevel: Level | null;
  pendingLevelCount: number;
  requiredConsecutiveEvidence: number;
}

interface RouteChangeSummaryProps {
  copy: EntryCopy;
  conceptTitle: string;
  nextConceptTitle: string | null;
  pathBefore: number;
  pathAfter: number;
  onContinueNext: () => void;
  onViewRoute: () => void;
  explainer?: AdaptiveExplainerProps;
}

export function RouteChangeSummary({
  copy,
  conceptTitle,
  nextConceptTitle,
  pathBefore,
  pathAfter,
  onContinueNext,
  onViewRoute,
  explainer,
}: RouteChangeSummaryProps) {
  const isMastered = pathAfter < pathBefore;

  if (!isMastered) {
    return null;
  }

  const routeCopy = copy.lesson.routeChange;
  const completed = nextConceptTitle === null;

  return (
    <section
      className="flex flex-col gap-5 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-6 dark:border-emerald-900/50 dark:bg-emerald-950/20"
      aria-live="polite"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold tracking-tight text-emerald-900 dark:text-emerald-300">
            {routeCopy.mastered(conceptTitle)}
          </h3>
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">
            {nextConceptTitle
              ? routeCopy.next(nextConceptTitle)
              : routeCopy.completed}
          </p>
        </div>

        <div className="flex w-fit flex-col gap-1">
          <div className="flex items-center gap-3 rounded-lg bg-emerald-100/50 px-4 py-2 dark:bg-emerald-900/30">
            <span
              aria-hidden="true"
              className="text-2xl font-bold tabular-nums tracking-tight text-emerald-700 dark:text-emerald-400"
            >
              {pathBefore}
            </span>
            <span
              className="text-emerald-600 dark:text-emerald-500"
              aria-hidden="true"
            >
              &rarr;
            </span>
            <span
              aria-hidden="true"
              className="text-2xl font-bold tabular-nums tracking-tight text-emerald-700 dark:text-emerald-400"
            >
              {pathAfter}
            </span>
          </div>
          <span className="sr-only">
            {routeCopy.stepsTransition(pathBefore, pathAfter)}
          </span>
        </div>
      </header>

      <p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-300">
        {routeCopy.explanation}
      </p>

      {explainer && (
        <details className="mt-2 group rounded-lg border border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/50 dark:bg-emerald-950/20">
          <summary className="cursor-pointer select-none rounded-lg px-4 py-3 text-sm font-medium text-emerald-800 outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-700 dark:text-emerald-300 dark:focus-visible:ring-emerald-400 group-open:border-b group-open:border-emerald-200 group-open:rounded-b-none dark:group-open:border-emerald-800/50">
            {routeCopy.adaptiveExplainer.trigger}
          </summary>
          <div className="flex flex-col gap-3 p-4 text-sm leading-relaxed text-emerald-800 dark:text-emerald-300">
            <p>
              {explainer.evidenceSource === 'quick-quiz'
                ? routeCopy.adaptiveExplainer.evidence.quickQuiz
                : routeCopy.adaptiveExplainer.evidence.openAnswer}
            </p>
            <p>{routeCopy.adaptiveExplainer.graphPruned(conceptTitle)}</p>
            <p>
              {nextConceptTitle
                ? routeCopy.adaptiveExplainer.nextUnlocked(nextConceptTitle)
                : routeCopy.adaptiveExplainer.nextCompleted}
            </p>
            <p>
              {explainer.stableLevelBefore !== explainer.stableLevelAfter
                ? routeCopy.adaptiveExplainer.stableChanged(
                    copy.levels[explainer.stableLevelBefore],
                    copy.levels[explainer.stableLevelAfter],
                  )
                : explainer.pendingLevel !== null
                  ? routeCopy.adaptiveExplainer.hysteresisPending(
                      copy.levels[explainer.pendingLevel],
                      explainer.pendingLevelCount,
                      explainer.requiredConsecutiveEvidence -
                        explainer.pendingLevelCount,
                    )
                  : routeCopy.adaptiveExplainer.stableUnchanged(
                      copy.levels[explainer.stableLevelAfter],
                    )}
            </p>
            <p>{routeCopy.adaptiveExplainer.neutralPolicy}</p>
          </div>
        </details>
      )}

      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        {completed ? (
          <button
            type="button"
            onClick={onViewRoute}
            className="rounded-lg bg-emerald-700 px-5 py-3 text-base font-medium text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 active:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:focus-visible:ring-emerald-400"
          >
            {copy.lesson.viewUpdatedRoute}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onContinueNext}
              className="rounded-lg bg-emerald-700 px-5 py-3 text-base font-medium text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 active:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:focus-visible:ring-emerald-400"
            >
              {copy.lesson.continueNext}
            </button>
            <button
              type="button"
              onClick={onViewRoute}
              className="rounded-lg border border-emerald-300 px-5 py-3 text-base font-medium text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 dark:border-emerald-700 dark:text-emerald-300 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/30 dark:focus-visible:ring-emerald-400"
            >
              {copy.lesson.viewUpdatedRoute}
            </button>
          </>
        )}
      </div>
    </section>
  );
}

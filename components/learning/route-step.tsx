'use client';

import { useState } from 'react';
import type { KnowledgeGraphView } from '../../lib/domain/knowledge-graph-view';
import type { Locale } from '../../lib/domain/learner-intake';
import type { EntryCopy } from '../../lib/i18n/copy';
import { KnowledgeGraph } from './knowledge-graph';

const primaryButtonClass =
  'rounded-xl bg-[#3158e7] px-5 py-3 text-base font-semibold text-white transition hover:bg-[#2446c7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3158e7]';

export function RouteStep({
  goal,
  levelLabel,
  styleLabel,
  masteredTitles,
  pathTitles,
  pathIds,
  view,
  locale,
  copy,
  selectedConceptId,
  onStartLesson,
  onSelectNode,
  onToggleUpcoming,
  onRestart,
}: {
  goal: string;
  levelLabel: string;
  styleLabel: string;
  masteredTitles: readonly string[];
  pathTitles: readonly string[];
  pathIds: readonly string[];
  view: KnowledgeGraphView;
  locale: Locale;
  copy: EntryCopy;
  selectedConceptId?: string | null;
  onStartLesson: (conceptId: string) => void;
  onSelectNode?: (conceptId: string) => void;
  onToggleUpcoming: () => void;
  onRestart: () => void;
}) {
  const [showUpcoming, setShowUpcoming] = useState(false);
  const completed = pathIds.length === 0;
  const hasUpcoming = pathIds.length > 1;
  const upcomingCount = pathIds.length - 1;
  const nextTitle = pathTitles[1] ?? pathIds[1] ?? '';
  const goalTitle =
    pathTitles[pathTitles.length - 1] ??
    pathIds[pathIds.length - 1] ??
    '';

  const handleToggleUpcoming = () => {
    onToggleUpcoming();
    setShowUpcoming((prev) => !prev);
  };

  return (
    <div className="route-experience">
      {completed ? (
        <section className="flex flex-col gap-3 rounded-lg border border-neutral-900 px-4 py-4 dark:border-neutral-100">
          <h2 className="text-base font-medium">{copy.route.completed}</h2>
          <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {copy.route.completedBody}
          </p>
        </section>
      ) : null}

      <KnowledgeGraph
        view={view}
        locale={locale}
        copy={copy}
        selectedConceptId={selectedConceptId}
        onSelectNode={onSelectNode}
        onStartLesson={onStartLesson}
      />

      <section className="route-preface">
        <p className="atlas-eyebrow">{copy.learn.goalPrefix} · {goal}</p>
        <p>{copy.route.preference} · {levelLabel} · {styleLabel}</p>
      </section>

      {masteredTitles.length > 0 ? (
        <section className="route-evidence">
          <h2>{copy.route.masteredTitle}</h2>
          <ul className="flex flex-wrap gap-2">
            {masteredTitles.map((title) => (
              <li
                key={title}
                className="rounded-full border border-neutral-900 px-3 py-1 text-sm dark:border-neutral-100"
              >
                {title}
                <span className="sr-only">（{copy.graph.status.mastered}）</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="route-path">
        <h2>{copy.route.pathTitle}</h2>
        {completed ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {copy.route.noSteps}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <ol id="learning-path-list" className="flex flex-col gap-3">
              {pathIds.map((id, index) => {
                const title = pathTitles[index] ?? id;
                const isStart = index === 0;

                if (isStart) {
                  return (
                    <li
                      key={id}
                      className="flex flex-col gap-4 rounded-xl border-2 border-neutral-900 bg-neutral-50/60 p-4 transition dark:border-neutral-100 dark:bg-neutral-900/40 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                    >
                      <div className="flex min-w-0 flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-neutral-900 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-white dark:bg-neutral-100 dark:text-neutral-900">
                            {copy.route.upNext}
                          </span>
                          <span
                            className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400"
                            aria-hidden="true"
                          >
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <span className="text-lg font-semibold tracking-tight text-neutral-950 break-words dark:text-neutral-50 sm:text-xl">
                          {title}
                        </span>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          {copy.route.startHere}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onStartLesson(id)}
                        className={`${primaryButtonClass} min-h-[44px] w-full shrink-0 sm:w-auto`}
                      >
                        {copy.graph.startLesson}
                      </button>
                    </li>
                  );
                }

                return (
                  <li
                    key={id}
                    hidden={!showUpcoming}
                    className={
                      !showUpcoming
                        ? 'hidden'
                        : 'flex flex-col gap-3 rounded-lg border border-[#dce4f0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between'
                    }
                  >
                    <span className="flex min-w-0 items-start gap-3">
                      <span
                        className="mt-0.5 shrink-0 text-xs tabular-nums text-neutral-500 dark:text-neutral-400"
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="text-base font-medium break-words">
                          {title}
                        </span>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          {copy.graph.status.upcoming}
                        </span>
                      </span>
                    </span>
                    <button
                      type="button"
                      data-explore-lesson={id}
                      onClick={() => onStartLesson(id)}
                      className="min-h-[44px] rounded-lg border border-[#dce4f0] px-4 py-2 text-sm font-semibold text-[#3158e7] transition hover:border-[#3158e7] hover:bg-[#edf2ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3158e7]"
                    >
                      {copy.graph.exploreLesson}
                    </button>
                  </li>
                );
              })}
            </ol>

            {hasUpcoming ? (
              <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/30 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {copy.route.upcomingRoadmap(upcomingCount)}
                  </span>
                  {!showUpcoming ? (
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                      {copy.route.roadmapPreview(nextTitle, goalTitle)}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  aria-expanded={showUpcoming}
                  aria-controls="learning-path-list"
                  onClick={handleToggleUpcoming}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-neutral-800 dark:focus-visible:ring-neutral-100"
                >
                  {showUpcoming ? copy.route.hideSteps : copy.route.showAllSteps}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={onRestart}
        className="w-fit rounded-lg border border-neutral-300 px-4 py-3 text-base transition hover:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-visible:ring-neutral-100"
      >
        {copy.route.restart}
      </button>
    </div>
  );
}

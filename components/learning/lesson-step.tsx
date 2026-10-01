'use client';

import type { Lesson } from '../../lib/domain/lessons';
import type { ExplanationStyle, Level } from '../../lib/domain/learner-intake';
import type { EntryCopy, Locale } from '../../lib/i18n/copy';
import type { AnswerMode } from '../../lib/domain/learner-intake';
import type { LessonAssessmentOutput } from '../../lib/domain/lesson-assessment';
import type { AssessmentClientErrorCode } from '../../lib/client/request-lesson-assessment';
import { OpenAnswerAssessment } from './open-answer-assessment';
import { RouteChangeSummary } from './route-change-summary';
import { AttentionExplorer } from './attention-explorer';
import { FableArticle } from './fable-article';
import { resolveLessonPresentation, type ContentDensity, type LessonSectionKey } from '../../lib/domain/lesson-presentation';

const primaryButtonClass =
  'rounded-lg bg-neutral-900 px-4 py-3 text-base font-medium text-white transition hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none active:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-neutral-100';

const radioClass = (selected: boolean) =>
  `flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition focus-within:ring-2 focus-within:ring-neutral-900 focus-within:ring-offset-2 dark:focus-within:ring-neutral-100 ${
    selected
      ? 'border-neutral-900 bg-neutral-50 dark:border-neutral-100 dark:bg-neutral-900'
      : 'border-neutral-300 dark:border-neutral-700'
  }`;

function sectionText(
  lesson: Lesson,
  key: LessonSectionKey,
  style: ExplanationStyle = 'story',
): string {
  switch (key) {
    case 'explanation':
      return (
        lesson.primaryExplanations?.[style] ||
        lesson.primaryExplanation ||
        lesson.simpleExplanation
      );
    case 'example':
      return lesson.workedExample;
    case 'rigorous':
      return lesson.rigorousNote;
    case 'mistake':
      return lesson.commonMistake;
  }
}

export function LessonStep({
  copy,
  locale,
  conceptTitle,
  nextConceptTitle,
  lesson,
  style,
  stableLevel,
  overrideDensity,
  onOverrideDensity,

  openAnswerMode,
  openAnswerText,
  openLoading,
  openError,
  openAssessment,
  openAccepted,
  useQuizFallback,
  onOpenAnswerModeChange,
  onOpenAnswerTextChange,
  onOpenSubmit,
  onOpenEdit,
  onUseQuiz,
  onReturnToOpen,

  quizSelected,
  quizChecked,
  isQuizCorrect,
  quizAttempts,
  pathBefore,
  pathAfter,
  onSelectChoice,
  onSubmitQuiz,
  onRetry,
  onContinueNext,
  onViewRoute,
  onIllustrationInteract,
  explainer,
}: {
  copy: EntryCopy;
  locale: Locale;
  conceptTitle: string;
  nextConceptTitle: string | null;
  lesson: Lesson;
  style: ExplanationStyle;
  stableLevel: Level;
  overrideDensity: ContentDensity | null;
  onOverrideDensity: (density: ContentDensity) => void;

  openAnswerMode: Exclude<AnswerMode, 'unsure'>;
  openAnswerText: string;
  openLoading: boolean;
  openError: AssessmentClientErrorCode | null;
  openAssessment: LessonAssessmentOutput | null;
  openAccepted: boolean;
  useQuizFallback: boolean;
  onOpenAnswerModeChange: (mode: Exclude<AnswerMode, 'unsure'>) => void;
  onOpenAnswerTextChange: (text: string) => void;
  onOpenSubmit: () => void;
  onOpenEdit: () => void;
  onUseQuiz: () => void;
  onReturnToOpen: () => void;

  quizSelected: number | null;
  quizChecked: boolean;
  isQuizCorrect: boolean;
  quizAttempts: number;
  pathBefore: number;
  pathAfter: number;
  onSelectChoice: (index: number) => void;
  onSubmitQuiz: () => void;
  onRetry: () => void;
  onContinueNext: () => void;
  onViewRoute: () => void;
  onIllustrationInteract?: () => void;
  explainer?: import('./route-change-summary').AdaptiveExplainerProps;
}) {
  const presentation = resolveLessonPresentation({
    stableLevel,
    explanationStyle: style,
    overrideDensity,
  });
  const lessonCopy = copy.lesson;
  const routeChanged = pathAfter < pathBefore;
  const quizRouteChanged = quizChecked && isQuizCorrect && routeChanged;
  const openRouteChanged = openAccepted && routeChanged;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <button
          type="button"
          onClick={onViewRoute}
          className="w-fit min-h-[44px] text-sm font-medium text-[#3158e7] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3158e7]"
        >
          <span aria-hidden="true">← </span>{lessonCopy.backToMap}
        </button>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {lessonCopy.currentLesson}
          </p>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{lesson.fable?.title ?? conceptTitle}</h2>
        </div>

        {!lesson.fable ? <fieldset className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-neutral-50/60 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/60">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            {lessonCopy.density.legend}
          </legend>
          <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            {lessonCopy.density.description}
          </p>
          <div className="flex flex-wrap gap-2 pt-1" role="radiogroup" aria-label={lessonCopy.density.legend}>
            {(['focused', 'balanced', 'deep'] as const).map((option) => {
              const isSelected = presentation.density === option;
              return (
                <label
                  key={option}
                  className={`flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2 text-sm transition focus-within:ring-2 focus-within:ring-neutral-900 focus-within:ring-offset-2 dark:focus-within:ring-neutral-100 ${
                    isSelected
                      ? 'border-neutral-900 bg-white font-medium text-neutral-950 shadow-sm dark:border-neutral-100 dark:bg-neutral-950 dark:text-neutral-50'
                      : 'border-neutral-200 bg-white/70 text-neutral-700 hover:border-neutral-300 hover:bg-white dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-900'
                  }`}
                >
                  <input
                    type="radio"
                    name="lesson-density"
                    value={option}
                    checked={isSelected}
                    onChange={() => onOverrideDensity(option)}
                    className="h-4 w-4 shrink-0 accent-neutral-900 focus:outline-none dark:accent-neutral-100"
                  />
                  <span className="flex items-center gap-1.5">
                    <span>{lessonCopy.density.options[option]}</span>
                    {isSelected ? (
                      <span
                        className="text-xs font-bold text-neutral-900 dark:text-neutral-100"
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset> : null}
      </header>

      {lesson.fable ? <FableArticle fable={lesson.fable} copy={copy} /> : <article className="flex flex-col gap-5">
        {presentation.visibleSections.map((key) => {
          if (key === 'explanation') {
            return (
              <section key={key} data-lesson-section={key} className="flex flex-col">
                <p className="text-base leading-relaxed text-neutral-900 sm:text-lg dark:text-neutral-100">
                  {sectionText(lesson, key, style)}
                </p>
              </section>
            );
          }
          return (
            <section
              key={key}
              data-lesson-section={key}
              className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/60"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                {lessonCopy.sections[key]}
              </h3>
              <p className="text-base leading-relaxed text-neutral-800 dark:text-neutral-200">
                {sectionText(lesson, key, style)}
              </p>
            </section>
          );
        })}
      </article>}

      {lesson.conceptId === 'attention' ? (
        <AttentionExplorer locale={locale} onInteract={onIllustrationInteract} />
      ) : null}
      {!useQuizFallback && !openAccepted ? (
        <OpenAnswerAssessment
          copy={copy}
          locale={locale}
          answerMode={openAnswerMode}
          answer={openAnswerText}
          loading={openLoading}
          error={openError}
          assessment={openAssessment}
          isAccepted={openAccepted}
          onAnswerModeChange={onOpenAnswerModeChange}
          onAnswerChange={onOpenAnswerTextChange}
          onSubmit={onOpenSubmit}
          onUseQuiz={onUseQuiz}
          onEdit={onOpenEdit}
        />
      ) : null}

      {(useQuizFallback && !openAccepted) ? (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={onReturnToOpen}
            className="w-fit text-sm text-neutral-600 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:text-neutral-400 dark:focus-visible:ring-neutral-100"
          >
            &larr; {lessonCopy.openAnswer.returnToOpen}
          </button>

          <form
            className="flex flex-col gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              if (!quizChecked) {
                onSubmitQuiz();
              }
            }}
          >
            <fieldset className="flex flex-col gap-3" disabled={quizChecked && isQuizCorrect}>
              <legend className="text-base font-medium">{lessonCopy.quizLegend}</legend>
              <p className="text-base leading-relaxed">{lesson.quiz.question}</p>
              <div className="flex flex-col gap-2">
                {lesson.quiz.choices.map((choice, index) => (
                  <label
                    key={choice}
                    className={radioClass(quizSelected === index)}
                  >
                    <input
                      type="radio"
                      name="lesson-quiz"
                      value={index}
                      checked={quizSelected === index}
                      onChange={() => onSelectChoice(index)}
                      disabled={quizChecked && isQuizCorrect}
                      className="mt-1 h-4 w-4 shrink-0 accent-neutral-900 dark:accent-neutral-100"
                    />
                    <span className="text-base leading-relaxed">{choice}</span>
                    {quizSelected === index ? (
                      <span className="ml-auto shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
                        {lessonCopy.selected}
                      </span>
                    ) : null}
                  </label>
                ))}
              </div>
            </fieldset>

            {!quizChecked ? (
              <button
                type="submit"
                disabled={quizSelected === null}
                className={`${primaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {lessonCopy.submitAnswer}
              </button>
            ) : null}
          </form>

          {quizChecked ? (
            quizRouteChanged ? (
              <RouteChangeSummary
                copy={copy}
                conceptTitle={conceptTitle}
                nextConceptTitle={nextConceptTitle}
                pathBefore={pathBefore}
                pathAfter={pathAfter}
                onContinueNext={onContinueNext}
                onViewRoute={onViewRoute}
                explainer={explainer}
              />
            ) : (
              <section
                className="flex flex-col gap-3 rounded-lg border border-neutral-300 px-4 py-4 dark:border-neutral-700"
                aria-live="polite"
              >
                <h3 className="text-base font-medium">
                  {isQuizCorrect ? lessonCopy.correctHeading : lessonCopy.incorrectHeading}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {isQuizCorrect
                    ? lessonCopy.correctNotMasteredMessage
                    : lessonCopy.incorrectMessage(lesson.quiz.explanation)}
                </p>
                {isQuizCorrect ? (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {lesson.quiz.explanation}
                  </p>
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row">
                  {isQuizCorrect ? (
                    <>
                      <button
                        type="button"
                        onClick={onRetry}
                        className={primaryButtonClass}
                      >
                        {lessonCopy.reinforceOnceMore}
                      </button>
                      <button
                        type="button"
                        onClick={onViewRoute}
                        className="rounded-lg border border-neutral-300 px-4 py-3 text-base transition hover:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-visible:ring-neutral-100"
                      >
                        {lessonCopy.viewUpdatedRoute}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={onRetry}
                      className={primaryButtonClass}
                    >
                      {lessonCopy.tryAgain}
                    </button>
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {lessonCopy.attempts(quizAttempts)}
                </p>
              </section>
            )
          ) : null}
        </div>
      ) : null}

      {openAccepted ? (
        <div className="flex flex-col gap-4">
          <OpenAnswerAssessment
            copy={copy}
            locale={locale}
            answerMode={openAnswerMode}
            answer={openAnswerText}
            loading={openLoading}
            error={openError}
            assessment={openAssessment}
            isAccepted={openAccepted}
            onAnswerModeChange={onOpenAnswerModeChange}
            onAnswerChange={onOpenAnswerTextChange}
            onSubmit={onOpenSubmit}
            onUseQuiz={onUseQuiz}
            onEdit={onOpenEdit}
          />
          {openRouteChanged ? (
            <RouteChangeSummary
              copy={copy}
              conceptTitle={conceptTitle}
              nextConceptTitle={nextConceptTitle}
              pathBefore={pathBefore}
              pathAfter={pathAfter}
              onContinueNext={onContinueNext}
              onViewRoute={onViewRoute}
              explainer={explainer}
            />
          ) : (
            <section className="flex flex-col gap-3 rounded-lg border border-neutral-300 px-4 py-4 dark:border-neutral-700">
              <h3 className="text-base font-medium">
                {lessonCopy.correctHeading}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {lessonCopy.correctNotMasteredMessage}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={onOpenEdit}
                  className={primaryButtonClass}
                >
                  {lessonCopy.reinforceOnceMore}
                </button>
                <button
                  type="button"
                  onClick={onViewRoute}
                  className="rounded-lg border border-neutral-300 px-4 py-3 text-base transition hover:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-visible:ring-neutral-100"
                >
                  {lessonCopy.viewUpdatedRoute}
                </button>
              </div>
            </section>
          )}
        </div>
      ) : null}
    </div>
  );
}

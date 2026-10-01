import type { EntryCopy, Locale } from '../../lib/i18n/copy';
import type { AnswerMode } from '../../lib/domain/learner-intake';
import type { LessonAssessmentOutput } from '../../lib/domain/lesson-assessment';
import type { AssessmentClientErrorCode } from '../../lib/client/request-lesson-assessment';
const primaryButtonClass =
  'rounded-lg bg-neutral-900 px-4 py-3 text-base font-medium text-white transition hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none active:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-neutral-100';

const inputClass =
  'w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 transition placeholder:text-neutral-500 focus-visible:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus-visible:border-neutral-500 dark:focus-visible:ring-neutral-100';

const radioClass = (selected: boolean) =>
  `flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition focus-within:ring-2 focus-within:ring-neutral-900 focus-within:ring-offset-2 dark:focus-within:ring-neutral-100 ${
    selected
      ? 'border-neutral-900 bg-neutral-50 dark:border-neutral-100 dark:bg-neutral-900'
      : 'border-neutral-300 dark:border-neutral-700'
  }`;
export function OpenAnswerAssessment({
  copy,
  locale,
  answerMode,
  answer,
  loading,
  error,
  assessment,
  isAccepted,
  onAnswerModeChange,
  onAnswerChange,
  onSubmit,
  onUseQuiz,
  onEdit,
}: {
  copy: EntryCopy;
  locale: Locale;
  answerMode: AnswerMode;
  answer: string;
  loading: boolean;
  error: AssessmentClientErrorCode | null;
  assessment: LessonAssessmentOutput | null;
  isAccepted: boolean;
  onAnswerModeChange: (mode: Exclude<AnswerMode, 'unsure'>) => void;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  onUseQuiz: () => void;
  onEdit: () => void;
}) {
  const modes: Exclude<AnswerMode, 'unsure'>[] = ['freeform', 'example', 'steps', 'technical'];

  if (assessment && isAccepted) {
    return (
      <section
        className="flex flex-col gap-4 rounded-lg border border-neutral-300 px-5 py-5 dark:border-neutral-700"
        aria-live="polite"
      >
        <h3 className="text-base font-medium">{copy.lesson.correctHeading}</h3>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {assessment.feedback[locale]}
        </p>
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {assessment.nextStep[locale]}
        </p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-neutral-300 px-5 py-5 dark:border-neutral-700">
      <header className="flex flex-col gap-2">
        <h3 className="text-base font-medium">{copy.lesson.openAnswer.title}</h3>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {copy.lesson.openAnswer.explanation}
        </p>
      </header>

      {assessment && !isAccepted ? (
        <div
          className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-4 dark:border-amber-900/50 dark:bg-amber-950/20"
          aria-live="polite"
        >
          <h4 className="text-sm font-medium text-amber-900 dark:text-amber-200">
            {copy.lesson.incorrectHeading}
          </h4>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {assessment.feedback[locale]}
          </p>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {copy.lesson.openAnswer.rejectedGuidance}
          </p>
          <div className="mt-2 flex gap-3">
            <button type="button" onClick={onEdit} className={primaryButtonClass}>
              {copy.lesson.openAnswer.editAnswer}
            </button>
            <button
              type="button"
              onClick={onUseQuiz}
              className="rounded-lg border border-neutral-300 px-4 py-3 text-sm transition hover:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-visible:ring-neutral-100"
            >
              {copy.lesson.openAnswer.useQuiz}
            </button>
          </div>
        </div>
      ) : error ? (
        <div
          className="flex flex-col gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-4 dark:border-red-900/50 dark:bg-red-950/20"
          aria-live="polite"
        >
          <p className="text-sm text-red-800 dark:text-red-300">
            {copy.lesson.openAnswer.errors[error] || copy.lesson.openAnswer.errors.INTERNAL_ERROR}
          </p>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={error === 'AI_NOT_CONFIGURED' ? onUseQuiz : onEdit}
              className={primaryButtonClass}
            >
              {error === 'AI_NOT_CONFIGURED' ? copy.lesson.openAnswer.useQuiz : copy.analysis.retry}
            </button>
            {error !== 'AI_NOT_CONFIGURED' && (
              <button
                type="button"
                onClick={onUseQuiz}
                className="rounded-lg border border-neutral-300 px-4 py-3 text-sm transition hover:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-visible:ring-neutral-100 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100"
              >
                {copy.lesson.openAnswer.useQuiz}
              </button>
            )}
          </div>
        </div>
      ) : (
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading && answer.trim().length > 0) {
              onSubmit();
            }
          }}
        >
          <fieldset className="flex flex-col gap-3" disabled={loading}>
            <legend className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {copy.prefs.answerModeLegend}
            </legend>
            <div className="flex flex-col gap-2">
              {modes.map((mode) => (
                <label key={mode} className={radioClass(answerMode === mode)}>
                  <input
                    type="radio"
                    name="assessment-mode"
                    value={mode}
                    checked={answerMode === mode}
                    onChange={() => onAnswerModeChange(mode)}
                    disabled={loading}
                    className="mt-1 h-4 w-4 shrink-0 accent-neutral-900 dark:accent-neutral-100"
                  />
                  <span className="text-sm leading-relaxed">
                    {copy.answerModes[mode].label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-3" disabled={loading}>
            <legend className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {copy.lesson.openAnswer.answerLegend}
            </legend>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {copy.answerModes[answerMode].prompt}
            </p>
            <textarea
              className={`${inputClass} min-h-[120px] resize-y`}
              placeholder={copy.lesson.openAnswer.answerPlaceholder}
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              disabled={loading}
            />
          </fieldset>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={loading || answer.trim().length === 0}
              className={`${primaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50 flex-1`}
            >
              {loading ? copy.lesson.openAnswer.loading : copy.lesson.openAnswer.submit}
            </button>
            <button
              type="button"
              onClick={onUseQuiz}
              disabled={loading}
              className="rounded-lg px-4 py-3 text-sm font-medium text-neutral-600 transition hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:text-neutral-400 dark:hover:text-neutral-100 dark:focus-visible:ring-neutral-100 disabled:opacity-50"
            >
              {copy.lesson.openAnswer.useQuiz}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

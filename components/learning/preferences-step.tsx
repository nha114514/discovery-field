'use client';

import type { EntryCopy } from '@/lib/i18n/copy';
import {
  answerModes,
  explanationStyles,
  levels,
  type AnswerMode,
  type ExplanationStyle,
  type LearnerIntake,
  type Level,
} from '@/lib/domain/learner-intake';

const radioClass = (selected: boolean) =>
  `flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition focus-within:ring-2 focus-within:ring-neutral-900 focus-within:ring-offset-2 dark:focus-within:ring-neutral-100 ${
    selected
      ? 'border-neutral-900 bg-neutral-50 dark:border-neutral-100 dark:bg-neutral-900'
      : 'border-neutral-300 dark:border-neutral-700'
  }`;

const primaryButtonClass =
  'rounded-lg bg-neutral-900 px-4 py-3 text-base font-medium text-white transition hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none active:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:ring-neutral-100';

const inputClass =
  'w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-900 dark:focus-visible:ring-neutral-100';

export { radioClass, primaryButtonClass, inputClass };

export function PreferencesStep({
  intake,
  copy,
  onIntakeChange,
  onSubmit,
}: {
  intake: LearnerIntake;
  copy: EntryCopy;
  onIntakeChange: (patch: Partial<LearnerIntake>) => void;
  onSubmit: () => void;
}) {
  const modeMeta = copy.answerModes[intake.answerMode];
  const unsure = intake.answerMode === 'unsure';

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <p className="rounded-lg border border-neutral-300 px-4 py-3 text-sm leading-relaxed text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
        {copy.prefs.honestyNotice}
      </p>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {copy.prefs.levelLegend}
        </legend>
        <div className="flex flex-col gap-2">
          {levels.map((level: Level) => (
            <label key={level} className={radioClass(intake.level === level)}>
              <input
                type="radio"
                name="level"
                value={level}
                checked={intake.level === level}
                onChange={() => onIntakeChange({ level })}
                className="h-4 w-4 accent-neutral-900 dark:accent-neutral-100"
              />
              <span className="text-base">{copy.levels[level]}</span>
              {intake.level === level ? (
                <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">
                  {copy.prefs.selected}
                </span>
              ) : null}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {copy.prefs.styleLegend}
        </legend>
        <div className="flex flex-col gap-2">
          {explanationStyles.map((style: ExplanationStyle) => (
            <label
              key={style}
              className={radioClass(intake.explanationStyle === style)}
            >
              <input
                type="radio"
                name="style"
                value={style}
                checked={intake.explanationStyle === style}
                onChange={() => onIntakeChange({ explanationStyle: style })}
                className="h-4 w-4 accent-neutral-900 dark:accent-neutral-100"
              />
              <span className="text-base">{copy.styles[style]}</span>
              {intake.explanationStyle === style ? (
                <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">
                  {copy.prefs.selected}
                </span>
              ) : null}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {copy.prefs.answerModeLegend}
        </legend>
        <div className="flex flex-col gap-2">
          {answerModes.map((mode: AnswerMode) => (
            <label
              key={mode}
              className={radioClass(intake.answerMode === mode)}
            >
              <input
                type="radio"
                name="answer-mode"
                value={mode}
                checked={intake.answerMode === mode}
                onChange={() => onIntakeChange({ answerMode: mode })}
                className="h-4 w-4 accent-neutral-900 dark:accent-neutral-100"
              />
              <span className="text-base">{copy.answerModes[mode].label}</span>
              {intake.answerMode === mode ? (
                <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">
                  {copy.prefs.selected}
                </span>
              ) : null}
            </label>
          ))}
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {modeMeta.prompt}
        </p>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          htmlFor="learning-outcome"
        >
          {copy.prefs.outcomeLabel}
        </label>
        <textarea
          id="learning-outcome"
          name="learning-outcome"
          rows={3}
          disabled={unsure}
          value={intake.learningOutcome}
          onChange={(event) =>
            onIntakeChange({ learningOutcome: event.target.value })
          }
          placeholder={modeMeta.prompt}
          className={`${inputClass} resize-y disabled:opacity-60`}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          htmlFor="prior-knowledge"
        >
          {copy.prefs.priorLabel}
        </label>
        <textarea
          id="prior-knowledge"
          name="prior-knowledge"
          rows={3}
          disabled={unsure}
          value={intake.priorKnowledgeAndConfusion}
          onChange={(event) =>
            onIntakeChange({
              priorKnowledgeAndConfusion: event.target.value,
            })
          }
          placeholder={copy.prefs.priorPlaceholder}
          className={`${inputClass} resize-y disabled:opacity-60`}
        />
      </div>

      <button type="submit" className={primaryButtonClass}>
        {copy.prefs.continueLabel}
      </button>
    </form>
  );
}

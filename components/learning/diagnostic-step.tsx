'use client';

import type { EntryCopy } from '@/lib/i18n/copy';
import { primaryButtonClass, radioClass } from './preferences-step';

export function ChallengeIntroStep({
  copy,
  onStart,
  onSkip,
}: {
  copy: EntryCopy;
  onStart: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">{copy.challenge.introTitle}</h2>
        <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
          {copy.challenge.introBody}
        </p>
      </section>
      <button type="button" onClick={onStart} className={primaryButtonClass}>
        {copy.challenge.start}
      </button>
      <button
        type="button"
        onClick={onSkip}
        className="w-fit rounded-lg border border-neutral-300 px-4 py-3 text-base transition hover:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-visible:ring-neutral-100"
      >
        {copy.challenge.skip}
      </button>
    </div>
  );
}

export function DiagnosticStep({
  copy,
  questionIndex,
  selectedIndex,
  onSelect,
  onSubmit,
  onSkip,
}: {
  copy: EntryCopy;
  questionIndex: number;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  const question = copy.diagnostics[questionIndex];
  const isLast = questionIndex + 1 >= copy.diagnostics.length;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <p
        className="text-sm text-neutral-500 dark:text-neutral-400"
        aria-live="polite"
      >
        {copy.challenge.progress(questionIndex + 1, copy.diagnostics.length)}
      </p>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {copy.challenge.referenceNote}
      </p>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-lg font-medium leading-snug">
          {question.question}
        </legend>
        <div className="flex flex-col gap-2">
          {question.choices.map((choice, index) => (
            <label key={choice} className={radioClass(selectedIndex === index)}>
              <input
                type="radio"
                name="answer"
                value={index}
                checked={selectedIndex === index}
                onChange={() => onSelect(index)}
                className="mt-1 h-4 w-4 shrink-0 accent-neutral-900 dark:accent-neutral-100"
              />
              <span className="text-base leading-relaxed">{choice}</span>
              {selectedIndex === index ? (
                <span className="ml-auto shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
                  {copy.prefs.selected}
                </span>
              ) : null}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={selectedIndex === null}
        className={`${primaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {isLast ? copy.challenge.finish : copy.challenge.next}
      </button>
      <button
        type="button"
        onClick={onSkip}
        className="w-fit text-sm text-neutral-600 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:text-neutral-400 dark:focus-visible:ring-neutral-100"
      >
        {copy.challenge.skip}
      </button>
    </form>
  );
}

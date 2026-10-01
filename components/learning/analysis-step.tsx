'use client';

import type { DiagnosisClientErrorCode } from '@/lib/client/request-diagnosis';
import type { EntryCopy } from '@/lib/i18n/copy';
import { primaryButtonClass } from './preferences-step';

export function AnalysisStep({
  copy,
  errorCode,
  onRetry,
  onContinueWithoutAi,
}: {
  copy: EntryCopy;
  errorCode: DiagnosisClientErrorCode | null;
  onRetry: () => void;
  onContinueWithoutAi: () => void;
}) {
  if (errorCode === null) {
    return (
      <section
        className="flex flex-col gap-4"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100"
          />
          <h2 className="text-lg font-medium">{copy.analysis.loadingTitle}</h2>
        </div>
        <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
          {copy.analysis.loadingBody}
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4" role="alert">
      <h2 className="text-lg font-medium">{copy.analysis.errorTitle}</h2>
      <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
        {copy.analysis.errors[errorCode]}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={onRetry} className={primaryButtonClass}>
          {copy.analysis.retry}
        </button>
        <button
          type="button"
          onClick={onContinueWithoutAi}
          className="rounded-lg border border-neutral-300 px-4 py-3 text-base transition hover:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-visible:ring-neutral-100"
        >
          {copy.analysis.continueWithoutAi}
        </button>
      </div>
    </section>
  );
}

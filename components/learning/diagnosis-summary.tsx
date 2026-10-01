'use client';

import { getConceptTitle } from '@/lib/domain/knowledge';
import type {
  CommunicationStyle,
  ConceptEvidence,
  SemanticDiagnosis,
} from '@/lib/domain/semantic-diagnostic';
import type { Locale } from '@/lib/domain/learner-intake';
import type { EntryCopy } from '@/lib/i18n/copy';
import { transformerConcepts } from '@/lib/domain/transformer-graph';

const conceptById = new Map(
  transformerConcepts.map((concept) => [concept.id, concept]),
);

const validConceptIds = new Set(conceptById.keys());

export function DiagnosisSummary({
  diagnosis,
  acceptedEvidence,
  locale,
  copy,
}: {
  diagnosis: SemanticDiagnosis | null;
  acceptedEvidence: readonly ConceptEvidence[];
  locale: Locale;
  copy: EntryCopy;
}) {
  const topEvidence = acceptedEvidence.slice(0, 5);
  const gapIds: string[] = [];
  const seenGaps = new Set<string>();
  for (const gap of diagnosis?.gaps ?? []) {
    if (!validConceptIds.has(gap.conceptId)) {
      continue;
    }
    if (seenGaps.has(gap.conceptId)) {
      continue;
    }
    seenGaps.add(gap.conceptId);
    if (gapIds.length >= 3) {
      break;
    }
    gapIds.push(gap.conceptId);
  }

  return (
    <section
      aria-labelledby="diagnosis-summary-title"
      className="rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-4 dark:border-neutral-700 dark:bg-neutral-900/40"
    >
      <h2
        id="diagnosis-summary-title"
        className="text-base font-medium"
      >
        {copy.diagnosis.title}
      </h2>

      {diagnosis ? (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {diagnosis.summary[locale]}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {copy.diagnosis.communicationStyleLabel}:{' '}
            {copy.diagnosis.communicationStyles[
              diagnosis.communicationStyle as CommunicationStyle
            ] ?? diagnosis.communicationStyle}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {copy.diagnosis.noStrongEvidence}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {copy.diagnosis.evidenceTitle}
          </h3>
          {topEvidence.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {copy.diagnosis.noStrongEvidence}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {topEvidence.map((item) => {
                const concept = conceptById.get(item.conceptId);
                const title = concept
                  ? getConceptTitle(concept, locale)
                  : item.conceptId;
                const percent = Math.round(item.score * 100);
                return (
                  <li
                    key={item.conceptId}
                    className="flex flex-col gap-1 rounded-md border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    <span className="text-sm font-medium break-words">
                      {title}
                      <span className="sr-only">
                        {copy.diagnosis.evidenceScore(percent)}
                      </span>
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {copy.diagnosis.evidenceScore(percent)}
                    </span>
                    <span className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                      {item.reason[locale]}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {copy.diagnosis.gapsTitle}
          </h3>
          {gapIds.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {copy.diagnosis.noGaps}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {gapIds.map((conceptId) => {
                const concept = conceptById.get(conceptId);
                const title = concept
                  ? getConceptTitle(concept, locale)
                  : conceptId;
                const gap = diagnosis?.gaps.find(
                  (item) => item.conceptId === conceptId,
                );
                return (
                  <li
                    key={conceptId}
                    className="flex flex-col gap-1 rounded-md border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    <span className="text-sm font-medium break-words">
                      {title}
                    </span>
                    <span className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                      {gap?.reason[locale] ?? ''}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
        {copy.diagnosis.disclaimer}
      </p>
    </section>
  );
}

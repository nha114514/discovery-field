import { z } from 'zod';
import type { MasteryByConcept } from './mastery';

export const SEMANTIC_EVIDENCE_MIN_CONFIDENCE = 0.65;

const trimmedNonEmpty = (max: number) =>
  z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, { message: 'must be non-empty' })
    .refine((value) => value.length <= max, {
      message: `must be at most ${max} characters`,
    });

const optionalTrimmedMax = (max: number) =>
  z
    .string()
    .max(max, { message: `must be at most ${max} characters` })
    .transform((value) => value.trim());

export const CommunicationStyleSchema = z.enum([
  'plain',
  'example-driven',
  'step-by-step',
  'technical',
  'uncertain',
]);
export type CommunicationStyle = z.infer<typeof CommunicationStyleSchema>;

export const LocalizedTextSchema = z
  .object({
    zh: z
      .string()
      .transform((value) => value.trim())
      .refine((value) => value.length > 0, { message: 'zh must be non-empty' })
      .refine((value) => value.length <= 500, {
        message: 'zh must be at most 500 characters',
      }),
    en: z
      .string()
      .transform((value) => value.trim())
      .refine((value) => value.length > 0, { message: 'en must be non-empty' })
      .refine((value) => value.length <= 500, {
        message: 'en must be at most 500 characters',
      }),
  })
  .strict();
export type LocalizedText = z.infer<typeof LocalizedTextSchema>;

const reasonTextSchema = z
  .object({
    zh: z
      .string()
      .transform((value) => value.trim())
      .refine((value) => value.length > 0, { message: 'zh must be non-empty' })
      .refine((value) => value.length <= 400, {
        message: 'zh must be at most 400 characters',
      }),
    en: z
      .string()
      .transform((value) => value.trim())
      .refine((value) => value.length > 0, { message: 'en must be non-empty' })
      .refine((value) => value.length <= 400, {
        message: 'en must be at most 400 characters',
      }),
  })
  .strict();

export const ConceptEvidenceSchema = z
  .object({
    conceptId: z.string().min(1),
    score: z.number().min(0).max(0.85),
    confidence: z.number().min(0).max(1),
    quote: trimmedNonEmpty(240),
    reason: reasonTextSchema,
  })
  .strict();
export type ConceptEvidence = z.infer<typeof ConceptEvidenceSchema>;

export const ConceptGapSchema = z
  .object({
    conceptId: z.string().min(1),
    reason: reasonTextSchema,
  })
  .strict();
export type ConceptGap = z.infer<typeof ConceptGapSchema>;

export const SemanticDiagnosisSchema = z
  .object({
    version: z.literal(1),
    summary: LocalizedTextSchema,
    communicationStyle: CommunicationStyleSchema,
    evidence: z.array(ConceptEvidenceSchema).max(25),
    gaps: z.array(ConceptGapSchema).max(10),
  })
  .strict();
export type SemanticDiagnosis = z.infer<typeof SemanticDiagnosisSchema>;

export const DiagnoseRequestSchema = z
  .object({
    goal: trimmedNonEmpty(120),
    locale: z.enum(['zh', 'en']),
    intake: z
      .object({
        level: z.enum(['beginner', 'some', 'solid']),
        explanationStyle: z.enum(['story', 'visual', 'rigorous']),
        answerMode: z.enum([
          'freeform',
          'example',
          'steps',
          'technical',
          'unsure',
        ]),
        learningOutcome: optionalTrimmedMax(2000),
        priorKnowledgeAndConfusion: optionalTrimmedMax(2000),
      })
      .strict(),
  })
  .strict();
export type DiagnoseRequest = z.infer<typeof DiagnoseRequestSchema>;

function normalizeQuote(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function clampScore(value: number): number {
  if (value < 0) return 0;
  if (value > 0.85) return 0.85;
  return value;
}

export function selectAcceptedEvidence(
  diagnosis: SemanticDiagnosis,
  priorKnowledgeText: string,
  validConceptIds: ReadonlySet<string>,
): readonly ConceptEvidence[] {
  const source = normalizeQuote(priorKnowledgeText);
  const best = new Map<string, ConceptEvidence>();

  for (const item of diagnosis.evidence) {
    if (!validConceptIds.has(item.conceptId)) {
      continue;
    }
    if (item.confidence < SEMANTIC_EVIDENCE_MIN_CONFIDENCE) {
      continue;
    }
    const quote = normalizeQuote(item.quote);
    if (quote.length === 0) {
      continue;
    }
    if (!source.includes(quote)) {
      continue;
    }

    const previous = best.get(item.conceptId);
    if (
      !previous ||
      item.score * item.confidence > previous.score * previous.confidence
    ) {
      best.set(item.conceptId, { ...item });
    }
  }

  return [...best.values()].sort((a, b) => {
    const productDiff = b.score * b.confidence - a.score * a.confidence;
    if (productDiff !== 0) {
      return productDiff;
    }
    return a.conceptId.localeCompare(b.conceptId);
  });
}

export function diagnosisToMastery(
  diagnosis: SemanticDiagnosis,
  priorKnowledgeText: string,
  validConceptIds: ReadonlySet<string>,
): MasteryByConcept {
  const accepted = selectAcceptedEvidence(
    diagnosis,
    priorKnowledgeText,
    validConceptIds,
  );
  const mastery: Record<string, number> = {};
  for (const item of accepted) {
    mastery[item.conceptId] = clampScore(item.score);
  }
  return mastery;
}

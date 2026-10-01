import { z } from 'zod';
import { LocalizedTextSchema } from './semantic-diagnostic';
import { updateMastery } from './mastery';

const trimmedNonEmptyMax = (max: number) =>
  z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, { message: 'must be non-empty' })
    .refine((value) => value.length <= max, {
      message: `must be at most ${max} characters`,
    });

export const LessonAssessmentRequestSchema = z
  .object({
    conceptId: trimmedNonEmptyMax(80),
    locale: z.enum(['zh', 'en']),
    answerMode: z.enum(['freeform', 'example', 'steps', 'technical']),
    answer: trimmedNonEmptyMax(3000),
  })
  .strict();
export type LessonAssessmentRequest = z.infer<typeof LessonAssessmentRequestSchema>;

export const LessonAssessmentOutputSchema = z
  .object({
    version: z.literal(1),
    conceptId: trimmedNonEmptyMax(80),
    score: z.number().min(0).max(1),
    confidence: z.number().min(0).max(1),
    quote: trimmedNonEmptyMax(400),
    feedback: LocalizedTextSchema,
    nextStep: LocalizedTextSchema,
  })
  .strict();
export type LessonAssessmentOutput = z.infer<typeof LessonAssessmentOutputSchema>;

function normalizeQuote(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function selectAcceptedLessonAssessment(
  assessment: LessonAssessmentOutput,
  learnerAnswer: string,
  expectedConceptId: string,
): LessonAssessmentOutput | null {
  if (assessment.conceptId !== expectedConceptId) {
    return null;
  }
  if (assessment.confidence < 0.65) {
    return null;
  }
  const quote = normalizeQuote(assessment.quote);
  if (quote.length === 0) {
    return null;
  }
  const source = normalizeQuote(learnerAnswer);
  if (!source.includes(quote)) {
    return null;
  }
  return assessment;
}

export function assessmentToMastery(
  previousScore: number,
  assessment: LessonAssessmentOutput,
  learnerAnswer: string,
  expectedConceptId: string,
): number {
  const accepted = selectAcceptedLessonAssessment(
    assessment,
    learnerAnswer,
    expectedConceptId,
  );
  if (!accepted) {
    return previousScore;
  }
  return updateMastery(previousScore, accepted.score);
}

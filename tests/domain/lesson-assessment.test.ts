import { describe, expect, it } from 'vitest';
import {
  LessonAssessmentRequestSchema,
  LessonAssessmentOutputSchema,
  selectAcceptedLessonAssessment,
  assessmentToMastery,
  type LessonAssessmentOutput,
} from '../../lib/domain/lesson-assessment';

describe('lesson-assessment schemas', () => {
  it('strict schemas reject extra fields', () => {
    const validRequest = {
      conceptId: 'matrix',
      locale: 'en',
      answerMode: 'freeform',
      answer: 'This is my answer',
    };
    expect(LessonAssessmentRequestSchema.safeParse(validRequest).success).toBe(true);
    expect(
      LessonAssessmentRequestSchema.safeParse({ ...validRequest, extra: 1 }).success,
    ).toBe(false);

    const validOutput = {
      version: 1,
      conceptId: 'matrix',
      score: 0.8,
      confidence: 0.9,
      quote: 'This is my answer',
      feedback: { zh: '好', en: 'good' },
      nextStep: { zh: '好', en: 'good' },
    };
    expect(LessonAssessmentOutputSchema.safeParse(validOutput).success).toBe(true);
    expect(
      LessonAssessmentOutputSchema.safeParse({ ...validOutput, extra: 1 }).success,
    ).toBe(false);
  });

  it('request rejects empty or oversized answers', () => {
    const baseRequest = {
      conceptId: 'matrix',
      locale: 'en',
      answerMode: 'freeform',
    };
    expect(LessonAssessmentRequestSchema.safeParse({ ...baseRequest, answer: '' }).success).toBe(false);
    expect(LessonAssessmentRequestSchema.safeParse({ ...baseRequest, answer: '   ' }).success).toBe(false);
    expect(
      LessonAssessmentRequestSchema.safeParse({ ...baseRequest, answer: 'a'.repeat(3001) }).success,
    ).toBe(false);
  });

  it('output rejects invalid version, score, confidence, or empty bilingual text', () => {
    const baseOutput = {
      version: 1,
      conceptId: 'matrix',
      score: 0.8,
      confidence: 0.9,
      quote: 'quote',
      feedback: { zh: '好', en: 'good' },
      nextStep: { zh: '好', en: 'good' },
    };

    expect(LessonAssessmentOutputSchema.safeParse({ ...baseOutput, version: 2 }).success).toBe(false);
    expect(LessonAssessmentOutputSchema.safeParse({ ...baseOutput, score: 1.1 }).success).toBe(false);
    expect(LessonAssessmentOutputSchema.safeParse({ ...baseOutput, confidence: -0.1 }).success).toBe(false);
    expect(LessonAssessmentOutputSchema.safeParse({ ...baseOutput, feedback: { zh: '', en: 'good' } }).success).toBe(false);
  });
});

describe('lesson-assessment logic', () => {
  const baseOutput: LessonAssessmentOutput = {
    version: 1,
    conceptId: 'matrix',
    score: 1.0,
    confidence: 0.9,
    quote: 'some exact quote',
    feedback: { zh: '好', en: 'good' },
    nextStep: { zh: '好', en: 'good' },
  };

  it('accepted exact quote', () => {
    const accepted = selectAcceptedLessonAssessment(
      baseOutput,
      'Here is some exact quote in my answer.',
      'matrix',
    );
    expect(accepted).not.toBeNull();
  });

  it('whitespace/case-normalized quote', () => {
    const output = { ...baseOutput, quote: '  SOME   EXACT\nquote ' };
    const accepted = selectAcceptedLessonAssessment(
      output,
      'here is some exact quote in my answer.',
      'matrix',
    );
    expect(accepted).not.toBeNull();
  });

  it('wrong concept rejection', () => {
    const accepted = selectAcceptedLessonAssessment(
      baseOutput,
      'Here is some exact quote in my answer.',
      'vector',
    );
    expect(accepted).toBeNull();
  });

  it('low-confidence rejection', () => {
    const output = { ...baseOutput, confidence: 0.6 };
    const accepted = selectAcceptedLessonAssessment(
      output,
      'Here is some exact quote in my answer.',
      'matrix',
    );
    expect(accepted).toBeNull();
  });

  it('accepts confidence exactly at 0.65 boundary', () => {
    const output = { ...baseOutput, confidence: 0.65 };
    const accepted = selectAcceptedLessonAssessment(
      output,
      'Here is some exact quote in my answer.',
      'matrix',
    );
    expect(accepted).not.toBeNull();
  });

  it('schema accepts score 0 and 1 boundaries', () => {
    const base = {
      version: 1 as const,
      conceptId: 'matrix',
      confidence: 0.9,
      quote: 'quote',
      feedback: { zh: '好', en: 'good' },
      nextStep: { zh: '好', en: 'good' },
    };
    expect(LessonAssessmentOutputSchema.safeParse({ ...base, score: 0 }).success).toBe(true);
    expect(LessonAssessmentOutputSchema.safeParse({ ...base, score: 1 }).success).toBe(true);
  });

  it('forged quote rejection', () => {
    const output = { ...baseOutput, quote: 'fake quote' };
    const accepted = selectAcceptedLessonAssessment(
      output,
      'Here is some exact quote in my answer.',
      'matrix',
    );
    expect(accepted).toBeNull();
  });

  it('rejected result leaves mastery unchanged', () => {
    const output = { ...baseOutput, conceptId: 'wrong' };
    const result = assessmentToMastery(0.35, output, 'Here is some exact quote.', 'matrix');
    expect(result).toBe(0.35);
  });

  it('full accepted answer updates 0.35 to 0.74', () => {
    const output = { ...baseOutput, score: 1.0 };
    const result = assessmentToMastery(0.35, output, 'Here is some exact quote.', 'matrix');
    expect(result).toBeCloseTo(0.74, 2);
  });

  it('partial accepted answer stays below 0.7', () => {
    const output = { ...baseOutput, score: 0.5 };
    const result = assessmentToMastery(0.35, output, 'Here is some exact quote.', 'matrix');
    // 0.35 * 0.4 + 0.5 * 0.6 = 0.14 + 0.30 = 0.44
    expect(result).toBeLessThan(0.7);
    expect(result).toBeCloseTo(0.44, 2);
  });
});

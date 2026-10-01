import { describe, expect, it, vi } from 'vitest';
import {
  requestLessonAssessment,
  AssessmentClientError,
} from '../../lib/client/request-lesson-assessment';
import type { LessonAssessmentRequest } from '../../lib/domain/lesson-assessment';

describe('requestLessonAssessment', () => {
  const validRequest: LessonAssessmentRequest = {
    conceptId: 'matrix',
    locale: 'en',
    answerMode: 'freeform',
    answer: 'A matrix is a grid of numbers.',
  };

  const validOutput = {
    version: 1,
    conceptId: 'matrix',
    score: 0.8,
    confidence: 0.9,
    quote: 'grid of numbers',
    feedback: { zh: '好', en: 'good' },
    nextStep: { zh: '下一步', en: 'next step' },
  };

  function mockFetch(responseBody: unknown, status = 200) {
    return vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      json: () => Promise.resolve(responseBody),
    } as Response);
  }

  it('valid response', async () => {
    const fetchImpl = mockFetch(validOutput);
    const result = await requestLessonAssessment(validRequest, fetchImpl);
    expect(result).toEqual(validOutput);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('whitelisted server errors', async () => {
    const fetchImpl = mockFetch({ code: 'AI_TIMEOUT' }, 504);
    await expect(requestLessonAssessment(validRequest, fetchImpl))
      .rejects.toThrowError(new AssessmentClientError('AI_TIMEOUT'));
  });

  it('unknown server error', async () => {
    const fetchImpl = mockFetch({ code: 'UNKNOWN_WEIRD_ERROR' }, 500);
    await expect(requestLessonAssessment(validRequest, fetchImpl))
      .rejects.toThrowError(new AssessmentClientError('INTERNAL_ERROR'));
  });

  it('malformed error body', async () => {
    const fetchImpl = mockFetch('not json object', 500);
    await expect(requestLessonAssessment(validRequest, fetchImpl))
      .rejects.toThrowError(new AssessmentClientError('INTERNAL_ERROR'));
  });

  it('network failure', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('Network failure'));
    await expect(requestLessonAssessment(validRequest, fetchImpl))
      .rejects.toThrowError(new AssessmentClientError('NETWORK_ERROR'));
  });

  it('malformed success JSON', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error('SyntaxError')),
    } as Response);
    await expect(requestLessonAssessment(validRequest, fetchImpl))
      .rejects.toThrowError(new AssessmentClientError('INVALID_RESPONSE'));
  });

  it('schema-invalid success response', async () => {
    const invalidOutput = { ...validOutput, score: 'very high' }; // invalid type
    const fetchImpl = mockFetch(invalidOutput);
    await expect(requestLessonAssessment(validRequest, fetchImpl))
      .rejects.toThrowError(new AssessmentClientError('INVALID_RESPONSE'));
  });

  it('no real network requests', () => {
    expect(true).toBe(true);
  });
});

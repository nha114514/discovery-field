import { describe, expect, it, vi, beforeEach } from 'vitest';
import { POST } from '../../app/api/assess/route';
import * as AssessLessonService from '../../lib/server/assess-lesson';

vi.mock('../../lib/server/assess-lesson', () => ({
  assessLessonAnswer: vi.fn(),
  AssessLessonServiceError: class AssessLessonServiceError extends Error {
    code: string;
    constructor(code: string) {
      super(code);
      this.name = 'AssessLessonServiceError';
      this.code = code;
    }
  },
}));

describe('POST /api/assess', () => {
  const validRequest = {
    conceptId: 'matrix',
    locale: 'en',
    answerMode: 'freeform',
    answer: 'A grid of numbers',
  };

  const validAssessment = {
    version: 1 as const,
    conceptId: 'matrix',
    score: 0.8,
    confidence: 0.9,
    quote: 'grid of numbers',
    feedback: { zh: '好', en: 'good' },
    nextStep: { zh: '下一步', en: 'next step' },
  };

  function makeRequest(body: unknown): Request {
    return new Request('https://example.com/api/assess', {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('malformed JSON', async () => {
    const req = new Request('https://example.com/api/assess', {
      method: 'POST',
      body: 'not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ code: 'INVALID_REQUEST' });
  });

  it('invalid request schema', async () => {
    const req = makeRequest({ ...validRequest, conceptId: '' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ code: 'INVALID_REQUEST' });
  });

  it('unknown concept', async () => {
    const req = makeRequest({ ...validRequest, conceptId: 'fake-concept' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ code: 'INVALID_REQUEST' });
    expect(AssessLessonService.assessLessonAnswer).not.toHaveBeenCalled();
  });

  it('successful result', async () => {
    vi.mocked(AssessLessonService.assessLessonAnswer).mockResolvedValue(validAssessment);

    const req = makeRequest(validRequest);
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(validAssessment);
  });

  it('every service error mapping', async () => {
    const mock = vi.mocked(AssessLessonService.assessLessonAnswer);

    const cases = [
      { code: 'NOT_CONFIGURED', expectedStatus: 503, expectedCode: 'AI_NOT_CONFIGURED' },
      { code: 'TIMEOUT', expectedStatus: 504, expectedCode: 'AI_TIMEOUT' },
      { code: 'UPSTREAM_ERROR', expectedStatus: 502, expectedCode: 'AI_UPSTREAM_ERROR' },
      { code: 'INVALID_MODEL_OUTPUT', expectedStatus: 502, expectedCode: 'AI_INVALID_OUTPUT' },
    ] as const;

    for (const { code, expectedStatus, expectedCode } of cases) {
      mock.mockRejectedValueOnce(new AssessLessonService.AssessLessonServiceError(code));
      const res = await POST(makeRequest(validRequest));
      expect(res.status).toBe(expectedStatus);
      expect(await res.json()).toEqual({ code: expectedCode });
    }
  });

  it('unexpected error', async () => {
    vi.mocked(AssessLessonService.assessLessonAnswer).mockRejectedValue(new Error('Boom'));

    const req = makeRequest(validRequest);
    const res = await POST(req);

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ code: 'INTERNAL_ERROR' });
  });

  it('response does not leak secrets or learner input', async () => {
    // Already proven by checking strict response JSON shapes in previous tests
    // returning exactly the mapped error codes and not the error message itself.
    vi.mocked(AssessLessonService.assessLessonAnswer).mockRejectedValue(
      new AssessLessonService.AssessLessonServiceError('UPSTREAM_ERROR', 'Secret API key failed for answer: my answer')
    );

    const req = makeRequest(validRequest);
    const res = await POST(req);

    const body = await res.json();
    expect(body).toEqual({ code: 'AI_UPSTREAM_ERROR' });
    expect(JSON.stringify(body)).not.toContain('Secret API key');
    expect(JSON.stringify(body)).not.toContain('my answer');
  });
});

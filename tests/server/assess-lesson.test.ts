import { describe, expect, it, vi } from 'vitest';
import {
  assessLessonAnswer,
  AssessLessonServiceError,
} from '../../lib/server/assess-lesson';
import type { LessonAssessmentRequest } from '../../lib/domain/lesson-assessment';

describe('assessLessonAnswer', () => {
  const env = {
    LLM_API_URL: 'https://api.example.com',
    LLM_API_KEY: 'test-key',
    LLM_MODEL: 'test-model',
  };

  const validInput: LessonAssessmentRequest = {
    conceptId: 'matrix',
    locale: 'en',
    answerMode: 'freeform',
    answer: 'A matrix is a grid of numbers.',
  };

  const validMockOutput = {
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

  function mockPayload(contentJson: unknown) {
    return {
      choices: [
        {
          message: {
            content: JSON.stringify(contentJson),
          },
        },
      ],
    };
  }

  it('successful mocked response and no real network request', async () => {
    const fetchImpl = mockFetch(mockPayload(validMockOutput));
    const result = await assessLessonAnswer(validInput, { fetchImpl, env });

    expect(result).toEqual(validMockOutput);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const call = fetchImpl.mock.calls[0];
    expect(call[0]).toBe(env.LLM_API_URL);

    const requestOptions = call[1];
    expect(requestOptions.headers.Authorization).toBe(`Bearer ${env.LLM_API_KEY}`);

    const body = JSON.parse(requestOptions.body);
    expect(body.model).toBe(env.LLM_MODEL);
  });

  it('disables default thinking only for the DeepSeek endpoint', async () => {
    const fetchImpl = mockFetch(mockPayload(validMockOutput));
    await assessLessonAnswer(validInput, {
      fetchImpl,
      env: { ...env, LLM_API_URL: 'https://api.deepseek.com/chat/completions', LLM_MODEL: 'deepseek-flash' },
    });
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body).thinking).toEqual({ type: 'disabled' });

    fetchImpl.mockClear();
    await assessLessonAnswer(validInput, { fetchImpl, env });
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).not.toHaveProperty('thinking');
  });

  it('trusted lesson data is used and answerMode is passed as evaluation context', async () => {
    const fetchImpl = mockFetch(mockPayload(validMockOutput));
    await assessLessonAnswer(validInput, { fetchImpl, env });

    const call = fetchImpl.mock.calls[0];
    const body = JSON.parse(call[1].body);

    const systemPrompt = body.messages[0].content;
    const userPrompt = body.messages[1].content;

    // Trusted lesson data used
    expect(systemPrompt).toContain('matrix');

    // Check answerMode is in user prompt
    expect(userPrompt).toContain('freeform');
    expect(userPrompt).toContain('A matrix is a grid of numbers.');
  });

  it('unknown concept makes zero network requests', async () => {
    const fetchImpl = mockFetch(mockPayload(validMockOutput));
    const badInput = { ...validInput, conceptId: 'fake-concept' };

    await expect(assessLessonAnswer(badInput, { fetchImpl, env }))
      .rejects.toThrowError(new AssessLessonServiceError('UPSTREAM_ERROR'));

    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('missing configuration', async () => {
    const fetchImpl = mockFetch(mockPayload(validMockOutput));
    await expect(assessLessonAnswer(validInput, { fetchImpl, env: {} }))
      .rejects.toThrowError(new AssessLessonServiceError('NOT_CONFIGURED'));
  });

  it('timeout', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new DOMException('TimeoutError', 'TimeoutError'));
    await expect(assessLessonAnswer(validInput, { fetchImpl, env }))
      .rejects.toThrowError(new AssessLessonServiceError('TIMEOUT'));
  });

  it('non-2xx upstream response', async () => {
    const fetchImpl = mockFetch({}, 500);
    await expect(assessLessonAnswer(validInput, { fetchImpl, env }))
      .rejects.toThrowError(new AssessLessonServiceError('UPSTREAM_ERROR'));
  });

  it('malformed JSON', async () => {
    const fetchImpl = mockFetch({
      choices: [{ message: { content: 'not json' } }]
    });
    await expect(assessLessonAnswer(validInput, { fetchImpl, env }))
      .rejects.toThrowError(new AssessLessonServiceError('INVALID_MODEL_OUTPUT'));
  });

  it('schema-invalid output', async () => {
    const invalidOutput = { ...validMockOutput, score: 2.0 }; // invalid score
    const fetchImpl = mockFetch(mockPayload(invalidOutput));
    await expect(assessLessonAnswer(validInput, { fetchImpl, env }))
      .rejects.toThrowError(new AssessLessonServiceError('INVALID_MODEL_OUTPUT'));
  });

  it('upstream response.json() rejection maps to INVALID_MODEL_OUTPUT', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error('bad body')),
    } as Response);
    await expect(assessLessonAnswer(validInput, { fetchImpl, env }))
      .rejects.toThrowError(new AssessLessonServiceError('INVALID_MODEL_OUTPUT'));
  });

  it('missing choices/message/content maps to INVALID_MODEL_OUTPUT', async () => {
    for (const payload of [
      {},
      { choices: [] },
      { choices: [null] },
      { choices: [{ message: null }] },
      { choices: [{ message: {} }] },
      { choices: [{ message: { content: '' } }] },
      { choices: [{ message: { content: 123 } }] },
    ]) {
      const fetchImpl = mockFetch(payload);
      await expect(assessLessonAnswer(validInput, { fetchImpl, env }))
        .rejects.toThrowError(new AssessLessonServiceError('INVALID_MODEL_OUTPUT'));
    }
  });
});

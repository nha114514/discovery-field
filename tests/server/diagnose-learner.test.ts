import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DiagnosticServiceError,
  diagnoseLearner,
} from '../../lib/server/diagnose-learner';
import { SemanticDiagnosisSchema } from '../../lib/domain/semantic-diagnostic';
import type { DiagnoseRequest } from '../../lib/domain/semantic-diagnostic';
import { transformerConcepts } from '../../lib/domain/transformer-graph';

const request: DiagnoseRequest = {
  goal: 'Transformer',
  locale: 'zh',
  intake: {
    level: 'beginner',
    explanationStyle: 'story',
    answerMode: 'freeform',
    learningOutcome: '想看懂注意力',
    priorKnowledgeAndConfusion: '我知道一点矩阵，向量是有序数值。',
  },
};

const env = {
  LLM_API_URL: 'https://api.example.com/v1/chat/completions',
  LLM_API_KEY: 'secret-key',
  LLM_MODEL: 'demo-model',
};

function okJson(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

const validDiagnosis = {
  version: 1,
  summary: { zh: '有基础', en: 'has basics' },
  communicationStyle: 'plain',
  evidence: [
    {
      conceptId: 'matrix',
      score: 0.7,
      confidence: 0.9,
      quote: '我知道一点矩阵',
      reason: { zh: '提到矩阵', en: 'mentions matrices' },
    },
  ],
  gaps: [
    {
      conceptId: 'attention',
      reason: { zh: '缺少注意力证据', en: 'no attention evidence' },
    },
  ],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('diagnoseLearner configuration', () => {
  it('does not call fetch when any env is missing', async () => {
    const fetchImpl = vi.fn();
    await expect(
      diagnoseLearner(request, {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        env: { LLM_API_URL: env.LLM_API_URL, LLM_API_KEY: '', LLM_MODEL: 'm' },
      }),
    ).rejects.toMatchObject({ code: 'NOT_CONFIGURED' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects invalid URL as NOT_CONFIGURED', async () => {
    const fetchImpl = vi.fn();
    await expect(
      diagnoseLearner(request, {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        env: { ...env, LLM_API_URL: 'not-a-url' },
      }),
    ).rejects.toMatchObject({ code: 'NOT_CONFIGURED' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe('diagnoseLearner request shape', () => {
  it('sends POST with bearer auth and model body', async () => {
    const fetchImpl = vi.fn(async () => okJson({
      choices: [{ message: { content: JSON.stringify(validDiagnosis) } }],
    }));

    await diagnoseLearner(request, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      env,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const call = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    const [url, init] = call;
    expect(url).toBe(env.LLM_API_URL);
    expect(init.method).toBe('POST');
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer secret-key');
    expect(headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(String(init.body)) as {
      model: string;
      temperature: number;
      max_tokens: number;
      response_format: { type: string };
      messages: { role: string; content: string }[];
    };
    expect(body.model).toBe('demo-model');
    expect(body.temperature).toBe(0.1);
    expect(body.max_tokens).toBe(1200);
    expect(body.response_format).toEqual({ type: 'json_object' });
    expect(String(init.body)).not.toContain('secret-key');
    expect(body.messages[0]?.role).toBe('system');
    expect(body.messages[1]?.role).toBe('user');
  });

  it('disables default thinking only for the DeepSeek endpoint', async () => {
    const fetchImpl = vi.fn(async () => okJson({
      choices: [{ message: { content: JSON.stringify(validDiagnosis) } }],
    }));
    await diagnoseLearner(request, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      env: { ...env, LLM_API_URL: 'https://api.deepseek.com/chat/completions', LLM_MODEL: 'deepseek-flash' },
    });
    const deepSeekCall = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    const deepSeekBody = JSON.parse(String(deepSeekCall[1].body));
    expect(deepSeekBody.thinking).toEqual({ type: 'disabled' });

    fetchImpl.mockClear();
    await diagnoseLearner(request, { fetchImpl: fetchImpl as unknown as typeof fetch, env });
    const genericCall = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    const genericBody = JSON.parse(String(genericCall[1].body));
    expect(genericBody).not.toHaveProperty('thinking');
  });

  it('includes all 25 conceptIds and scoring rules in system prompt', async () => {
    const fetchImpl = vi.fn(async () => okJson({
      choices: [{ message: { content: JSON.stringify(validDiagnosis) } }],
    }));

    await diagnoseLearner(request, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      env,
    });

    const call = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    const body = JSON.parse(String(call[1].body)) as {
      messages: { content: string }[];
    };
    const system = body.messages[0]!.content;
    for (const concept of transformerConcepts) {
      expect(system).toContain(concept.id);
    }
    expect(system).toContain('intelligence');
    expect(system).toContain('0.45');
    expect(system).toContain('untrusted');
  });
});

describe('diagnoseLearner output handling', () => {
  it('returns validated SemanticDiagnosis', async () => {
    const fetchImpl = vi.fn(async () => okJson({
      choices: [{ message: { content: JSON.stringify(validDiagnosis) } }],
    }));
    const result = await diagnoseLearner(request, {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      env,
    });
    expect(() => SemanticDiagnosisSchema.parse(result)).not.toThrow();
    expect(result.evidence[0]?.conceptId).toBe('matrix');
  });

  it('maps non-2xx to UPSTREAM_ERROR', async () => {
    const fetchImpl = vi.fn(
      async () => new Response('nope', { status: 500 }),
    );
    await expect(
      diagnoseLearner(request, {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        env,
      }),
    ).rejects.toMatchObject({ code: 'UPSTREAM_ERROR' });
  });

  it('maps missing content to INVALID_MODEL_OUTPUT', async () => {
    const fetchImpl = vi.fn(async () => okJson({ choices: [] }));
    await expect(
      diagnoseLearner(request, {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        env,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_MODEL_OUTPUT' });
  });

  it('maps non-JSON content to INVALID_MODEL_OUTPUT', async () => {
    const fetchImpl = vi.fn(async () => okJson({
      choices: [{ message: { content: 'not-json' } }],
    }));
    await expect(
      diagnoseLearner(request, {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        env,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_MODEL_OUTPUT' });
  });

  it('maps schema-invalid JSON to INVALID_MODEL_OUTPUT', async () => {
    const fetchImpl = vi.fn(async () => okJson({
      choices: [{ message: { content: JSON.stringify({ version: 2 }) } }],
    }));
    await expect(
      diagnoseLearner(request, {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        env,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_MODEL_OUTPUT' });
  });

  it('maps AbortError to TIMEOUT', async () => {
    const fetchImpl = vi.fn(async () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      throw error;
    });
    await expect(
      diagnoseLearner(request, {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        env,
      }),
    ).rejects.toMatchObject({ code: 'TIMEOUT' });
  });

  it('maps other fetch failures to UPSTREAM_ERROR', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('network down');
    });
    await expect(
      diagnoseLearner(request, {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        env,
      }),
    ).rejects.toMatchObject({ code: 'UPSTREAM_ERROR' });
  });

  it('error messages do not include key or user text', async () => {
    const fetchImpl = vi.fn(
      async () => new Response('secret-body', { status: 500 }),
    );
    try {
      await diagnoseLearner(request, {
        fetchImpl: fetchImpl as unknown as typeof fetch,
        env,
      });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(DiagnosticServiceError);
      const message = (error as Error).message;
      expect(message).not.toContain('secret-key');
      expect(message).not.toContain('我知道一点矩阵');
      expect(message).not.toContain('secret-body');
    }
  });
});

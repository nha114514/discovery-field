import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DiagnosisClientError,
  requestDiagnosis,
} from '../../lib/client/request-diagnosis';
import type { DiagnoseRequest } from '../../lib/domain/semantic-diagnostic';

const input: DiagnoseRequest = {
  goal: 'Transformer',
  locale: 'zh',
  intake: {
    level: 'beginner',
    explanationStyle: 'story',
    answerMode: 'freeform',
    learningOutcome: '想看懂注意力',
    priorKnowledgeAndConfusion: '我知道一点矩阵。',
  },
};

const validDiagnosis = {
  version: 1,
  summary: { zh: '有基础', en: 'has basics' },
  communicationStyle: 'plain',
  evidence: [],
  gaps: [],
};

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('requestDiagnosis', () => {
  it('POSTs JSON to /api/diagnose with correct header and body', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(validDiagnosis));
    await requestDiagnosis(input, fetchImpl as unknown as typeof fetch);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const call = fetchImpl.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(call[0]).toBe('/api/diagnose');
    expect(call[1].method).toBe('POST');
    expect((call[1].headers as Record<string, string>)['Content-Type']).toBe(
      'application/json',
    );
    expect(JSON.parse(String(call[1].body))).toEqual(input);
  });

  it('returns validated SemanticDiagnosis on success', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(validDiagnosis));
    const result = await requestDiagnosis(
      input,
      fetchImpl as unknown as typeof fetch,
    );
    expect(result.version).toBe(1);
  });

  it('maps network failure to NETWORK_ERROR', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('offline');
    });
    await expect(
      requestDiagnosis(input, fetchImpl as unknown as typeof fetch),
    ).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });

  it('maps 503 AI_NOT_CONFIGURED', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ code: 'AI_NOT_CONFIGURED' }, 503),
    );
    await expect(
      requestDiagnosis(input, fetchImpl as unknown as typeof fetch),
    ).rejects.toMatchObject({ code: 'AI_NOT_CONFIGURED' });
  });

  it('maps 504 AI_TIMEOUT', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ code: 'AI_TIMEOUT' }, 504),
    );
    await expect(
      requestDiagnosis(input, fetchImpl as unknown as typeof fetch),
    ).rejects.toMatchObject({ code: 'AI_TIMEOUT' });
  });

  it('maps 502 AI_UPSTREAM_ERROR', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ code: 'AI_UPSTREAM_ERROR' }, 502),
    );
    await expect(
      requestDiagnosis(input, fetchImpl as unknown as typeof fetch),
    ).rejects.toMatchObject({ code: 'AI_UPSTREAM_ERROR' });
  });

  it('maps 502 AI_INVALID_OUTPUT', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ code: 'AI_INVALID_OUTPUT' }, 502),
    );
    await expect(
      requestDiagnosis(input, fetchImpl as unknown as typeof fetch),
    ).rejects.toMatchObject({ code: 'AI_INVALID_OUTPUT' });
  });

  it('maps unknown server codes to INTERNAL_ERROR', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ code: 'SOMETHING_ELSE' }, 500),
    );
    await expect(
      requestDiagnosis(input, fetchImpl as unknown as typeof fetch),
    ).rejects.toMatchObject({ code: 'INTERNAL_ERROR' });
  });

  it('maps 2xx non-JSON to INVALID_RESPONSE', async () => {
    const fetchImpl = vi.fn(
      async () => new Response('not-json', { status: 200 }),
    );
    await expect(
      requestDiagnosis(input, fetchImpl as unknown as typeof fetch),
    ).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });

  it('maps 2xx schema-invalid JSON to INVALID_RESPONSE', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ version: 99 }));
    await expect(
      requestDiagnosis(input, fetchImpl as unknown as typeof fetch),
    ).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });

  it('throws DiagnosisClientError with typed code', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('x');
    });
    await expect(
      requestDiagnosis(input, fetchImpl as unknown as typeof fetch),
    ).rejects.toBeInstanceOf(DiagnosisClientError);
  });
});

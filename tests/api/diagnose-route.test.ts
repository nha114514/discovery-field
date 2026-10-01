import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../../app/api/diagnose/route';

const validBody = {
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

const originalEnv = { ...process.env };
const originalFetch = globalThis.fetch;

beforeEach(() => {
  process.env.LLM_API_URL = '';
  process.env.LLM_API_KEY = '';
  process.env.LLM_MODEL = '';
});

afterEach(() => {
  process.env.LLM_API_URL = originalEnv.LLM_API_URL;
  process.env.LLM_API_KEY = originalEnv.LLM_API_KEY;
  process.env.LLM_MODEL = originalEnv.LLM_MODEL;
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

function requestWith(body: unknown): Request {
  return new Request('http://localhost/api/diagnose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/diagnose', () => {
  it('returns 400 INVALID_REQUEST for invalid JSON', async () => {
    const response = await POST(requestWith('{not-json'));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ code: 'INVALID_REQUEST' });
  });

  it('returns 400 INVALID_REQUEST for invalid fields', async () => {
    const response = await POST(
      requestWith({ ...validBody, goal: '   ' }),
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ code: 'INVALID_REQUEST' });
  });

  it('returns 503 AI_NOT_CONFIGURED without env', async () => {
    const response = await POST(requestWith(validBody));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ code: 'AI_NOT_CONFIGURED' });
  });

  it('returns 200 with valid diagnosis from mock upstream', async () => {
    process.env.LLM_API_URL = 'https://api.example.com/v1/chat/completions';
    process.env.LLM_API_KEY = 'route-secret';
    process.env.LLM_MODEL = 'demo-model';

    globalThis.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: JSON.stringify(validDiagnosis) } }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    ) as unknown as typeof fetch;

    const response = await POST(requestWith(validBody));
    expect(response.status).toBe(200);
    const data = (await response.json()) as typeof validDiagnosis;
    expect(data.version).toBe(1);
    expect(JSON.stringify(data)).not.toContain('route-secret');
    expect(JSON.stringify(data)).not.toContain('我知道一点矩阵');
  });

  it('returns 502 AI_UPSTREAM_ERROR when upstream fails', async () => {
    process.env.LLM_API_URL = 'https://api.example.com/v1/chat/completions';
    process.env.LLM_API_KEY = 'route-secret';
    process.env.LLM_MODEL = 'demo-model';

    globalThis.fetch = vi.fn(
      async () => new Response('upstream-boom', { status: 500 }),
    ) as unknown as typeof fetch;

    const response = await POST(requestWith(validBody));
    expect(response.status).toBe(502);
    const body = await response.text();
    expect(body).not.toContain('route-secret');
    expect(body).not.toContain('upstream-boom');
    expect(body).not.toContain('stack');
    expect(JSON.parse(body)).toEqual({ code: 'AI_UPSTREAM_ERROR' });
  });
});

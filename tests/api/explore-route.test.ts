import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../../app/api/explore/route';

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
const article = {
  title: '丝绸之路',
  lede: '丝绸之路不是一条单独的道路，而是一组贸易与交流网络。',
  paragraphs: ['货物沿着不同路线移动。', '商人也带走了语言和观念。', '这些交流长期改变了沿线社会。'],
  fable: null,
  related: [
    { topic: '粟特商人', connection: '看谁参与了交流' },
    { topic: '海上丝绸之路', connection: '比较海上的路线' },
  ],
};

function request(body: unknown): Request {
  return new Request('http://localhost/api/explore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env.LLM_API_URL = originalEnv.LLM_API_URL;
  process.env.LLM_API_KEY = originalEnv.LLM_API_KEY;
  process.env.LLM_MODEL = originalEnv.LLM_MODEL;
  vi.restoreAllMocks();
});

describe('POST /api/explore', () => {
  it('rejects empty topics and malformed JSON before calling the model', async () => {
    const fetchImpl = vi.fn();
    globalThis.fetch = fetchImpl as unknown as typeof fetch;
    expect((await POST(request({ topic: ' ', locale: 'zh' }))).status).toBe(400);
    expect((await POST(request('{broken'))).status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('returns a validated article for a topic outside Transformer', async () => {
    process.env.LLM_API_URL = 'https://api.deepseek.com/chat/completions';
    process.env.LLM_API_KEY = 'test-only-key';
    process.env.LLM_MODEL = 'deepseek-flash';
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify(article) } }],
    }), { status: 200 })) as unknown as typeof fetch;
    const response = await POST(request({ topic: '丝绸之路', locale: 'zh' }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(article);
  });

  it('returns a non-sensitive configuration error', async () => {
    process.env.LLM_API_URL = '';
    process.env.LLM_API_KEY = '';
    process.env.LLM_MODEL = '';
    const response = await POST(request({ topic: '海洋', locale: 'zh' }));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ code: 'AI_NOT_CONFIGURED' });
  });

  it('shares simultaneous identical requests instead of making two paid calls', async () => {
    process.env.LLM_API_URL = 'https://api.deepseek.com/chat/completions';
    process.env.LLM_API_KEY = 'test-only-key';
    process.env.LLM_MODEL = 'deepseek-flash';
    let finish!: () => void;
    const gate = new Promise<void>((resolve) => { finish = resolve; });
    const fetchImpl = vi.fn(async () => {
      await gate;
      return Response.json({ choices: [{ message: { content: JSON.stringify(article) } }] });
    });
    globalThis.fetch = fetchImpl as unknown as typeof fetch;
    const first = POST(request({ topic: 'shared-topic', locale: 'zh' }));
    const second = POST(request({ topic: 'shared-topic', locale: 'zh' }));
    await vi.waitFor(() => expect(fetchImpl).toHaveBeenCalled());
    finish();
    const responses = await Promise.all([first, second]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(await Promise.all(responses.map((response) => response.json()))).toEqual([article, article]);
  });
});

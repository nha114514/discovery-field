import { describe, expect, it, vi } from 'vitest';
import { exploreTopic } from '../../lib/server/explore-topic';

const input = { topic: '量子纠缠', locale: 'zh' as const };
const env = {
  LLM_API_URL: 'https://api.deepseek.com/chat/completions',
  LLM_API_KEY: 'test-only-key',
  LLM_MODEL: 'deepseek-flash',
};
const article = {
  title: '量子纠缠',
  lede: '两个量子系统可以具有无法分别描述的共同状态。',
  paragraphs: [
    '这种关联不是两颗小球事先商量好的答案。',
    '对其中一个系统进行测量，会改变我们对整体状态的描述。',
    '纠缠可以用于量子通信，但不能用来超光速传送消息。',
  ],
  fable: null,
  related: [
    { topic: '量子测量', connection: '理解测量在这里扮演的角色' },
    { topic: '贝尔不等式', connection: '看实验如何检验这种关联' },
  ],
};

function responseWith(content: string, status = 200): Response {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status });
}

describe('exploreTopic', () => {
  it('asks DeepSeek for a plain article and returns only validated content', async () => {
    const fetchImpl = vi.fn(async () => responseWith(JSON.stringify(article)));
    const result = await exploreTopic(input, { env, fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(result).toEqual(article);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(env.LLM_API_URL);
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${env.LLM_API_KEY}`);
    const body = JSON.parse(String(init.body));
    expect(body.model).toBe(env.LLM_MODEL);
    expect(body.response_format).toEqual({ type: 'json_object' });
    expect(body.thinking).toEqual({ type: 'disabled' });
    expect(body.messages[1].content).toContain(input.topic);
    expect(body.messages[0].content).toContain('No quizzes');
    expect(body.messages[0].content).toContain('For research-level concepts, begin with a fable');
    expect(body.messages[0].content).toContain('Keep technical names out of fable.title and fable.paragraphs');
    expect(String(init.body)).not.toContain(env.LLM_API_KEY);
  });

  it('does not send DeepSeek-only options to another provider', async () => {
    const fetchImpl = vi.fn(async () => responseWith(JSON.stringify(article)));
    await exploreTopic(input, {
      env: { ...env, LLM_API_URL: 'https://example.com/chat/completions' },
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    const call = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(String(call[1].body))).not.toHaveProperty('thinking');
  });

  it('rejects missing configuration before fetching', async () => {
    const fetchImpl = vi.fn();
    await expect(exploreTopic(input, {
      env: { ...env, LLM_API_KEY: '' },
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })).rejects.toMatchObject({ code: 'NOT_CONFIGURED' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('maps provider failures without returning upstream text', async () => {
    const fetchImpl = vi.fn(async () => responseWith('provider secret detail', 500));
    await expect(exploreTopic(input, {
      env,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })).rejects.toMatchObject({ code: 'UPSTREAM_ERROR' });
  });

  it('rejects malformed model articles', async () => {
    const fetchImpl = vi.fn(async () => responseWith(JSON.stringify({ ...article, related: [] })));
    await expect(exploreTopic(input, {
      env,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })).rejects.toMatchObject({ code: 'INVALID_MODEL_OUTPUT' });
  });

  it('maps timeout separately from other network errors', async () => {
    const fetchImpl = vi.fn(async () => { throw new DOMException('timeout', 'TimeoutError'); });
    await expect(exploreTopic(input, {
      env,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })).rejects.toMatchObject({ code: 'TIMEOUT' });
  });
});

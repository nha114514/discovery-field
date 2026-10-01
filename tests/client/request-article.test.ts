import { describe, expect, it, vi } from 'vitest';
import { requestArticle } from '../../lib/client/request-article';

const input = { topic: '珊瑚礁', locale: 'zh' as const };
const article = {
  title: '珊瑚礁',
  lede: '珊瑚礁是海里的栖息地。',
  paragraphs: ['珊瑚虫会分泌骨骼。', '骨骼慢慢形成礁体。', '很多生物在这里生活。'],
  fable: null,
  related: [
    { topic: '珊瑚白化', connection: '看气温的影响' },
    { topic: '海洋生态系统', connection: '了解更大的环境' },
  ],
};

describe('requestArticle', () => {
  it('posts the selected topic without assessment fields', async () => {
    const fetchImpl = vi.fn(async () => Response.json(article));
    expect(await requestArticle(input, { fetchImpl: fetchImpl as unknown as typeof fetch })).toEqual(article);
    const call = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(call[0]).toBe('/api/explore');
    expect(JSON.parse(String(call[1].body))).toEqual(input);
  });

  it('rejects invalid article responses', async () => {
    const fetchImpl = vi.fn(async () => Response.json({ title: 'wrong' }));
    await expect(requestArticle(input, { fetchImpl: fetchImpl as unknown as typeof fetch }))
      .rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });

  it('maps known server errors and hides unknown ones', async () => {
    const unavailable = vi.fn(async () => Response.json({ code: 'AI_NOT_CONFIGURED' }, { status: 503 }));
    await expect(requestArticle(input, { fetchImpl: unavailable as unknown as typeof fetch }))
      .rejects.toMatchObject({ code: 'AI_NOT_CONFIGURED' });
    const unknown = vi.fn(async () => Response.json({ code: 'secret-upstream-detail' }, { status: 502 }));
    await expect(requestArticle(input, { fetchImpl: unknown as unknown as typeof fetch }))
      .rejects.toMatchObject({ code: 'INTERNAL_ERROR' });
  });

  it('preserves cancellation so a stale article cannot replace the current one', async () => {
    const abort = new DOMException('aborted', 'AbortError');
    const fetchImpl = vi.fn(async () => { throw abort; });
    await expect(requestArticle(input, { fetchImpl: fetchImpl as unknown as typeof fetch }))
      .rejects.toBe(abort);
  });
});

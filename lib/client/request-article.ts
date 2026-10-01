import {
  ExploreArticleSchema,
  type ExploreArticle,
  type ExploreRequest,
} from '../domain/topic-exploration';

export type ArticleClientErrorCode =
  | 'INVALID_REQUEST'
  | 'AI_NOT_CONFIGURED'
  | 'AI_TIMEOUT'
  | 'AI_UPSTREAM_ERROR'
  | 'AI_INVALID_OUTPUT'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'INVALID_RESPONSE';

const serverCodes = new Set<ArticleClientErrorCode>([
  'INVALID_REQUEST',
  'AI_NOT_CONFIGURED',
  'AI_TIMEOUT',
  'AI_UPSTREAM_ERROR',
  'AI_INVALID_OUTPUT',
  'INTERNAL_ERROR',
]);

export class ArticleClientError extends Error {
  constructor(readonly code: ArticleClientErrorCode) {
    super(code);
    this.name = 'ArticleClientError';
  }
}

export async function requestArticle(
  input: ExploreRequest,
  options?: { fetchImpl?: typeof fetch; signal?: AbortSignal },
): Promise<ExploreArticle> {
  let response: Response;
  try {
    response = await (options?.fetchImpl ?? fetch)('/api/explore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: options?.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new ArticleClientError('NETWORK_ERROR');
  }

  if (!response.ok) {
    let rawCode: unknown;
    try {
      rawCode = (await response.json()).code;
    } catch {
      throw new ArticleClientError('INTERNAL_ERROR');
    }
    const code = typeof rawCode === 'string' && serverCodes.has(rawCode as ArticleClientErrorCode)
      ? rawCode as ArticleClientErrorCode
      : 'INTERNAL_ERROR';
    throw new ArticleClientError(code);
  }

  try {
    const parsed = ExploreArticleSchema.safeParse(await response.json());
    if (parsed.success) return parsed.data;
  } catch {
    // Invalid JSON and invalid article shapes share the same safe UI message.
  }
  throw new ArticleClientError('INVALID_RESPONSE');
}

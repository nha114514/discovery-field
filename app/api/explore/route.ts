import { ExploreRequestSchema, type ExploreArticle } from '../../../lib/domain/topic-exploration';
import { ExploreServiceError, exploreTopic } from '../../../lib/server/explore-topic';

export const runtime = 'nodejs';

// React development remounts and simultaneous readers can request the same
// article together. Share only the in-flight work; discard it when it settles.
const inFlight = new Map<string, Promise<ExploreArticle>>();

function errorResponse(code: string, status: number): Response {
  return Response.json({ code }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse('INVALID_REQUEST', 400);
  }

  const parsed = ExploreRequestSchema.safeParse(payload);
  if (!parsed.success) return errorResponse('INVALID_REQUEST', 400);

  try {
    const key = JSON.stringify(parsed.data);
    let pending = inFlight.get(key);
    if (!pending) {
      pending = exploreTopic(parsed.data).finally(() => inFlight.delete(key));
      inFlight.set(key, pending);
    }
    const article = await pending;
    return Response.json(article, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof ExploreServiceError) {
      switch (error.code) {
        case 'NOT_CONFIGURED': return errorResponse('AI_NOT_CONFIGURED', 503);
        case 'TIMEOUT': return errorResponse('AI_TIMEOUT', 504);
        case 'UPSTREAM_ERROR': return errorResponse('AI_UPSTREAM_ERROR', 502);
        case 'INVALID_MODEL_OUTPUT': return errorResponse('AI_INVALID_OUTPUT', 502);
      }
    }
    return errorResponse('INTERNAL_ERROR', 500);
  }
}

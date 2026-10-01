import { DiagnoseRequestSchema } from '../../../lib/domain/semantic-diagnostic';
import {
  DiagnosticServiceError,
  diagnoseLearner,
} from '../../../lib/server/diagnose-learner';

export const runtime = 'nodejs';

function json(code: string, status: number): Response {
  return Response.json({ code }, { status });
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json('INVALID_REQUEST', 400);
  }

  const parsed = DiagnoseRequestSchema.safeParse(body);
  if (!parsed.success) {
    return json('INVALID_REQUEST', 400);
  }

  try {
    const diagnosis = await diagnoseLearner(parsed.data);
    return Response.json(diagnosis, { status: 200 });
  } catch (error) {
    if (error instanceof DiagnosticServiceError) {
      switch (error.code) {
        case 'NOT_CONFIGURED':
          return json('AI_NOT_CONFIGURED', 503);
        case 'TIMEOUT':
          return json('AI_TIMEOUT', 504);
        case 'UPSTREAM_ERROR':
          return json('AI_UPSTREAM_ERROR', 502);
        case 'INVALID_MODEL_OUTPUT':
          return json('AI_INVALID_OUTPUT', 502);
        default:
          return json('INTERNAL_ERROR', 500);
      }
    }
    return json('INTERNAL_ERROR', 500);
  }
}

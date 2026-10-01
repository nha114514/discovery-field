import { LessonAssessmentRequestSchema } from '../../../lib/domain/lesson-assessment';
import {
  AssessLessonServiceError,
  assessLessonAnswer,
} from '../../../lib/server/assess-lesson';
import { transformerConcepts } from '../../../lib/domain/transformer-graph';

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

  const parsed = LessonAssessmentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return json('INVALID_REQUEST', 400);
  }

  const conceptExists = transformerConcepts.some((c) => c.id === parsed.data.conceptId);
  if (!conceptExists) {
    return json('INVALID_REQUEST', 400);
  }

  try {
    const assessment = await assessLessonAnswer(parsed.data);
    return Response.json(assessment, { status: 200 });
  } catch (error) {
    if (error instanceof AssessLessonServiceError) {
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

import {
  LessonAssessmentOutputSchema,
  type LessonAssessmentRequest,
  type LessonAssessmentOutput,
} from '../domain/lesson-assessment';

export type AssessmentClientErrorCode =
  | 'INVALID_REQUEST'
  | 'AI_NOT_CONFIGURED'
  | 'AI_TIMEOUT'
  | 'AI_UPSTREAM_ERROR'
  | 'AI_INVALID_OUTPUT'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'INVALID_RESPONSE';

const SERVER_CODES: ReadonlySet<string> = new Set([
  'INVALID_REQUEST',
  'AI_NOT_CONFIGURED',
  'AI_TIMEOUT',
  'AI_UPSTREAM_ERROR',
  'AI_INVALID_OUTPUT',
  'INTERNAL_ERROR',
]);

export class AssessmentClientError extends Error {
  readonly code: AssessmentClientErrorCode;

  constructor(code: AssessmentClientErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'AssessmentClientError';
    this.code = code;
  }
}

function mapServerCode(raw: unknown): AssessmentClientErrorCode {
  if (typeof raw === 'string' && SERVER_CODES.has(raw)) {
    return raw as AssessmentClientErrorCode;
  }
  return 'INTERNAL_ERROR';
}

export async function requestLessonAssessment(
  input: LessonAssessmentRequest,
  fetchImpl: typeof fetch = fetch,
): Promise<LessonAssessmentOutput> {
  let response: Response;
  try {
    response = await fetchImpl('/api/assess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    throw new AssessmentClientError('NETWORK_ERROR');
  }

  if (!response.ok) {
    let code: AssessmentClientErrorCode = 'INTERNAL_ERROR';
    try {
      const body = (await response.json()) as { code?: unknown };
      code = mapServerCode(body.code);
    } catch {
      code = 'INTERNAL_ERROR';
    }
    throw new AssessmentClientError(code);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new AssessmentClientError('INVALID_RESPONSE');
  }

  const parsed = LessonAssessmentOutputSchema.safeParse(payload);
  if (!parsed.success) {
    throw new AssessmentClientError('INVALID_RESPONSE');
  }
  return parsed.data;
}

import {
  SemanticDiagnosisSchema,
  type DiagnoseRequest,
  type SemanticDiagnosis,
} from '../domain/semantic-diagnostic';

export type DiagnosisClientErrorCode =
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

export class DiagnosisClientError extends Error {
  readonly code: DiagnosisClientErrorCode;

  constructor(code: DiagnosisClientErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'DiagnosisClientError';
    this.code = code;
  }
}

function mapServerCode(raw: unknown): DiagnosisClientErrorCode {
  if (typeof raw === 'string' && SERVER_CODES.has(raw)) {
    return raw as DiagnosisClientErrorCode;
  }
  return 'INTERNAL_ERROR';
}

export async function requestDiagnosis(
  input: DiagnoseRequest,
  fetchImpl: typeof fetch = fetch,
): Promise<SemanticDiagnosis> {
  let response: Response;
  try {
    response = await fetchImpl('/api/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    throw new DiagnosisClientError('NETWORK_ERROR');
  }

  if (!response.ok) {
    let code: DiagnosisClientErrorCode = 'INTERNAL_ERROR';
    try {
      const body = (await response.json()) as { code?: unknown };
      code = mapServerCode(body.code);
    } catch {
      code = 'INTERNAL_ERROR';
    }
    throw new DiagnosisClientError(code);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new DiagnosisClientError('INVALID_RESPONSE');
  }

  const parsed = SemanticDiagnosisSchema.safeParse(payload);
  if (!parsed.success) {
    throw new DiagnosisClientError('INVALID_RESPONSE');
  }
  return parsed.data;
}

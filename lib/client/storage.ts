import { z } from 'zod';
import type { LearnerIntake } from '../domain/learner-intake';
import type { LearnerBeliefState } from '../domain/learner-belief';
import { transformerConcepts } from '../domain/transformer-graph';

export const STORAGE_VERSION = 1;

const LevelSchema = z.enum(['beginner', 'some', 'solid']);
const ExplanationStyleSchema = z.enum(['story', 'visual', 'rigorous']);
const AnswerModeSchema = z.enum(['freeform', 'example', 'steps', 'technical', 'unsure']);

const validConceptIds = transformerConcepts.map(c => c.id);
const ConceptIdSchema = z.string().refine((val) => validConceptIds.includes(val), { message: 'Invalid concept ID' });

const IntakeSchema = z.object({
  level: LevelSchema,
  explanationStyle: ExplanationStyleSchema,
  answerMode: AnswerModeSchema,
  learningOutcome: z.string(),
  priorKnowledgeAndConfusion: z.string(),
}).strict() satisfies z.ZodType<LearnerIntake>;

const ConceptEvidenceMetaSchema = z.object({
  evidenceCount: z.number().int().positive(),
  lastEvidenceAt: z.number().int().nonnegative(),
  reliability: z.number().finite().min(0).max(1),
}).strict();

const StageSchema = z.object({
  beginner: z.number().finite().min(0).max(1),
  some: z.number().finite().min(0).max(1),
  solid: z.number().finite().min(0).max(1),
}).strict() satisfies z.ZodType<LearnerBeliefState['stage']>;

const LearnerBeliefStateSchema = z.object({
  stage: StageSchema,
  mastery: z.record(ConceptIdSchema, z.number().finite().min(0).max(1)),
  conceptEvidence: z.record(ConceptIdSchema, ConceptEvidenceMetaSchema),
  knowledgeEvidenceCount: z.number().int().nonnegative(),
  interactionCount: z.number().int().nonnegative(),
  stableLevel: LevelSchema,
  pendingLevel: LevelSchema.nullable(),
  pendingLevelCount: z.number().int().nonnegative(),
}).strict() satisfies z.ZodType<LearnerBeliefState>;

const StepSchema = z.enum([
  'prefs',
  'analyzing',
  'challenge-intro',
  'challenge',
  'route',
  'lesson'
]);

const SessionStateSchema = z.object({
  version: z.literal(STORAGE_VERSION),
  goal: z.string(),
  step: StepSchema,
  intake: IntakeSchema,
  learnerBelief: LearnerBeliefStateSchema,
  activeConceptId: ConceptIdSchema.nullable(),
}).strict();

export type SessionState = z.infer<typeof SessionStateSchema>;

export function getSessionKey(goal: string): string {
  return `gibc_v2_session_${goal.trim().toLowerCase()}`;
}

export function saveSession(goal: string, state: Omit<SessionState, 'version' | 'goal'>): void {
  try {
    const key = getSessionKey(goal);
    const fullState: SessionState = {
      ...state,
      version: STORAGE_VERSION,
      goal: goal.trim().toLowerCase(),
    };
    window.localStorage.setItem(key, JSON.stringify(fullState));
  } catch {
    // Ignore quota/security exceptions, continue in memory
  }
}

export function loadSession(goal: string): SessionState | null {
  try {
    const key = getSessionKey(goal);
    const stored = window.localStorage.getItem(key);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);
    const result = SessionStateSchema.safeParse(parsed);

    if (!result.success || result.data.goal !== goal.trim().toLowerCase()) {
      window.localStorage.removeItem(key); // Reject and remove malformed or unsupported sessions
      return null;
    }

    return result.data;
  } catch {
    try {
      window.localStorage.removeItem(getSessionKey(goal));
    } catch {
      // ignore
    }
    return null;
  }
}

export function clearSession(goal: string): void {
  try {
    const key = getSessionKey(goal);
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

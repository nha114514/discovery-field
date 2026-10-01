import type { Level } from './learner-intake';
import type { MasteryByConcept } from './mastery';

export type StagePosterior = Readonly<Record<Level, number>>;

export type KnowledgeEvidenceSource =
  | 'diagnostic'
  | 'open-answer'
  | 'quick-quiz';

export type NeutralInteractionSource =
  | 'graph-select'
  | 'locale-toggle'
  | 'content-expand'
  | 'retry'
  | 'navigation';

export type LearnerEvidenceEvent =
  | {
      kind: 'knowledge';
      source: KnowledgeEvidenceSource;
      conceptId: string;
      score: number;
      confidence: number;
      difficulty: number;
      /** Unix milliseconds. Must be a finite non-negative integer. */
      at: number;
    }
  | {
      kind: 'interaction';
      source: NeutralInteractionSource;
    };

export interface ConceptEvidenceMeta {
  evidenceCount: number;
  lastEvidenceAt: number;
  reliability: number;
}

export interface LearnerBeliefState {
  stage: StagePosterior;
  mastery: MasteryByConcept;
  conceptEvidence: Readonly<Record<string, ConceptEvidenceMeta>>;
  knowledgeEvidenceCount: number;
  interactionCount: number;
  stableLevel: Level;
  pendingLevel: Level | null;
  pendingLevelCount: number;
}

/**
 * All values below are MVP heuristics.
 * They are NOT calibrated from production learner data and are NOT
 * presented as literature-fitted parameters.
 */
export const LEARNER_BELIEF_PARAMS = {
  conceptPrior: 0.35,
  stagePriors: {
    beginner: { beginner: 0.72, some: 0.23, solid: 0.05 },
    some: { beginner: 0.18, some: 0.64, solid: 0.18 },
    solid: { beginner: 0.05, some: 0.25, solid: 0.7 },
  },
  source: {
    diagnostic: { guess: 0.25, slip: 0.15, learn: 0 },
    'open-answer': { guess: 0.15, slip: 0.15, learn: 0.05 },
    'quick-quiz': { guess: 0.2, slip: 0.1, learn: 0.08 },
  },
  ability: {
    beginner: 1.25,
    some: 2.75,
    solid: 4.25,
  },
  /** Stage MAP must beat stableLevel by this margin to enter hysteresis. */
  stageChangeMargin: 0.1,
  /** Consecutive agreeing candidates required before stableLevel flips. */
  requiredConsecutiveEvidence: 2,
} as const;

const LEVEL_ORDER: readonly Level[] = ['beginner', 'some', 'solid'];

function isUnitInterval(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function copyStage(stage: StagePosterior): StagePosterior {
  return {
    beginner: stage.beginner,
    some: stage.some,
    solid: stage.solid,
  };
}

function copyMastery(mastery: MasteryByConcept): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [conceptId, value] of Object.entries(mastery)) {
    if (conceptId.trim().length === 0) {
      throw new Error('Mastery conceptId must be non-empty');
    }
    if (!isUnitInterval(value)) {
      throw new Error(
        `Mastery score must be a finite number in [0, 1] for ${conceptId}`,
      );
    }
    result[conceptId] = value;
  }
  return result;
}

function copyConceptEvidence(
  conceptEvidence: Readonly<Record<string, ConceptEvidenceMeta>>,
): Record<string, ConceptEvidenceMeta> {
  const result: Record<string, ConceptEvidenceMeta> = {};
  for (const [conceptId, meta] of Object.entries(conceptEvidence)) {
    result[conceptId] = {
      evidenceCount: meta.evidenceCount,
      lastEvidenceAt: meta.lastEvidenceAt,
      reliability: meta.reliability,
    };
  }
  return result;
}

function validateKnowledgeEvent(event: Extract<
  LearnerEvidenceEvent,
  { kind: 'knowledge' }
>): void {
  if (event.conceptId.trim().length === 0) {
    throw new Error('conceptId must be non-empty');
  }
  if (!isUnitInterval(event.score)) {
    throw new RangeError(
      `score must be a finite number in [0, 1], got ${event.score}`,
    );
  }
  if (!isUnitInterval(event.confidence)) {
    throw new RangeError(
      `confidence must be a finite number in [0, 1], got ${event.confidence}`,
    );
  }
  if (
    !Number.isInteger(event.difficulty) ||
    event.difficulty < 1 ||
    event.difficulty > 5
  ) {
    throw new RangeError(
      `difficulty must be an integer in [1, 5], got ${event.difficulty}`,
    );
  }
  if (!Number.isFinite(event.at) || event.at < 0 || !Number.isInteger(event.at)) {
    throw new RangeError(
      `at must be a finite non-negative integer Unix ms timestamp, got ${event.at}`,
    );
  }
}

function updateConceptMastery(
  prior: number,
  event: Extract<LearnerEvidenceEvent, { kind: 'knowledge' }>,
): number {
  const { guess, slip, learn } = LEARNER_BELIEF_PARAMS.source[event.source];
  const priorClamped = clamp01(prior);
  const score = event.score;
  const confidence = event.confidence;

  const knownLikelihood =
    Math.pow(1 - slip, score) * Math.pow(slip, 1 - score);
  const unknownLikelihood =
    Math.pow(guess, score) * Math.pow(1 - guess, 1 - score);
  const weightedKnown = Math.pow(knownLikelihood, confidence);
  const weightedUnknown = Math.pow(unknownLikelihood, confidence);
  const denominator =
    priorClamped * weightedKnown + (1 - priorClamped) * weightedUnknown;

  let posterior =
    denominator > 0 ? (priorClamped * weightedKnown) / denominator : priorClamped;

  if (!Number.isFinite(posterior)) {
    posterior = priorClamped;
  }

  const next = posterior + (1 - posterior) * learn * confidence;
  return clamp01(next);
}

function updateStagePosterior(
  stage: StagePosterior,
  event: Extract<LearnerEvidenceEvent, { kind: 'knowledge' }>,
): StagePosterior {
  const { guess } = LEARNER_BELIEF_PARAMS.source[event.source];
  const weights: Record<Level, number> = {
    beginner: 0,
    some: 0,
    solid: 0,
  };

  for (const level of LEVEL_ORDER) {
    const expectedSuccess =
      guess +
      (1 - guess) *
        sigmoid(1.1 * (LEARNER_BELIEF_PARAMS.ability[level] - event.difficulty));
    const likelihood =
      Math.pow(expectedSuccess, event.score) *
      Math.pow(1 - expectedSuccess, 1 - event.score);
    const weighted = Math.pow(likelihood, event.confidence);
    weights[level] = stage[level] * weighted;
  }

  const total = weights.beginner + weights.some + weights.solid;
  if (!(total > 0) || !Number.isFinite(total)) {
    return copyStage(stage);
  }

  return {
    beginner: clamp01(weights.beginner / total),
    some: clamp01(weights.some / total),
    solid: clamp01(weights.solid / total),
  };
}

function updateStageHysteresis(
  stableLevel: Level,
  pendingLevel: Level | null,
  pendingLevelCount: number,
  stage: StagePosterior,
): Pick<
  LearnerBeliefState,
  'stableLevel' | 'pendingLevel' | 'pendingLevelCount'
> {
  const candidate = mostLikelyLevel(stage);
  if (candidate === stableLevel) {
    return { stableLevel, pendingLevel: null, pendingLevelCount: 0 };
  }

  const advantage = stage[candidate] - stage[stableLevel];
  if (!(advantage >= LEARNER_BELIEF_PARAMS.stageChangeMargin)) {
    return { stableLevel, pendingLevel: null, pendingLevelCount: 0 };
  }

  const nextCount =
    pendingLevel === candidate ? pendingLevelCount + 1 : 1;

  if (nextCount >= LEARNER_BELIEF_PARAMS.requiredConsecutiveEvidence) {
    return { stableLevel: candidate, pendingLevel: null, pendingLevelCount: 0 };
  }

  return { stableLevel, pendingLevel: candidate, pendingLevelCount: nextCount };
}

export function createLearnerBelief(
  selfReportedLevel: Level,
  mastery?: MasteryByConcept,
): LearnerBeliefState {
  const prior = LEARNER_BELIEF_PARAMS.stagePriors[selfReportedLevel];
  if (!prior) {
    throw new Error(`Unknown self-reported level: ${String(selfReportedLevel)}`);
  }
  return {
    stage: {
      beginner: prior.beginner,
      some: prior.some,
      solid: prior.solid,
    },
    mastery: mastery ? copyMastery(mastery) : {},
    conceptEvidence: {},
    knowledgeEvidenceCount: 0,
    interactionCount: 0,
    stableLevel: selfReportedLevel,
    pendingLevel: null,
    pendingLevelCount: 0,
  };
}

export function applyLearnerEvidence(
  state: LearnerBeliefState,
  event: LearnerEvidenceEvent,
): LearnerBeliefState {
  if (event.kind === 'interaction') {
    return {
      stage: copyStage(state.stage),
      mastery: copyMastery(state.mastery),
      conceptEvidence: copyConceptEvidence(state.conceptEvidence),
      knowledgeEvidenceCount: state.knowledgeEvidenceCount,
      interactionCount: state.interactionCount + 1,
      stableLevel: state.stableLevel,
      pendingLevel: state.pendingLevel,
      pendingLevelCount: state.pendingLevelCount,
    };
  }

  validateKnowledgeEvent(event);

  // confidence === 0 is not knowledge evidence.
  if (event.confidence === 0) {
    return {
      stage: copyStage(state.stage),
      mastery: copyMastery(state.mastery),
      conceptEvidence: copyConceptEvidence(state.conceptEvidence),
      knowledgeEvidenceCount: state.knowledgeEvidenceCount,
      interactionCount: state.interactionCount,
      stableLevel: state.stableLevel,
      pendingLevel: state.pendingLevel,
      pendingLevelCount: state.pendingLevelCount,
    };
  }

  const mastery = copyMastery(state.mastery);
  const conceptEvidence = copyConceptEvidence(state.conceptEvidence);
  const previousConceptScore =
    mastery[event.conceptId] ?? LEARNER_BELIEF_PARAMS.conceptPrior;
  mastery[event.conceptId] = updateConceptMastery(
    previousConceptScore,
    event,
  );

  const previousMeta = conceptEvidence[event.conceptId];
  const previousCount = previousMeta?.evidenceCount ?? 0;
  const previousReliability = previousMeta?.reliability ?? 0;
  const previousAt = previousMeta?.lastEvidenceAt ?? 0;
  const nextCount = previousCount + 1;
  conceptEvidence[event.conceptId] = {
    evidenceCount: nextCount,
    lastEvidenceAt: Math.max(previousAt, event.at),
    reliability:
      (previousReliability * previousCount + event.confidence) / nextCount,
  };

  const stage = updateStagePosterior(state.stage, event);
  const hysteresis = updateStageHysteresis(
    state.stableLevel,
    state.pendingLevel,
    state.pendingLevelCount,
    stage,
  );

  return {
    stage,
    mastery,
    conceptEvidence,
    knowledgeEvidenceCount: state.knowledgeEvidenceCount + 1,
    interactionCount: state.interactionCount,
    ...hysteresis,
  };
}

export function mostLikelyLevel(stage: StagePosterior): Level {
  let best: Level = LEVEL_ORDER[0];
  for (const level of LEVEL_ORDER) {
    if (stage[level] > stage[best]) {
      best = level;
    }
  }
  return best;
}

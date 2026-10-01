import { describe, expect, it } from 'vitest';
import {
  applyLearnerEvidence,
  createLearnerBelief,
  mostLikelyLevel,
  LEARNER_BELIEF_PARAMS,
  type LearnerEvidenceEvent,
  type StagePosterior,
} from '../../lib/domain/learner-belief';
import { MASTERY_THRESHOLD } from '../../lib/domain/mastery';

function sumStage(stage: StagePosterior): number {
  return stage.beginner + stage.some + stage.solid;
}

function knowledgeEvent(
  overrides: Partial<Extract<LearnerEvidenceEvent, { kind: 'knowledge' }>> = {},
): LearnerEvidenceEvent {
  return {
    kind: 'knowledge',
    source: 'diagnostic',
    conceptId: 'vector',
    score: 1,
    confidence: 1,
    difficulty: 3,
    at: 1_000,
    ...overrides,
  };
}

function expectFiniteProbability(value: number): void {
  expect(Number.isFinite(value)).toBe(true);
  expect(value).toBeGreaterThanOrEqual(0);
  expect(value).toBeLessThanOrEqual(1);
}

describe('createLearnerBelief', () => {
  it('uses accurate fixed priors that sum to 1', () => {
    const beginner = createLearnerBelief('beginner');
    expect(beginner.stage).toEqual({
      beginner: 0.72,
      some: 0.23,
      solid: 0.05,
    });
    expect(sumStage(beginner.stage)).toBeCloseTo(1, 12);

    const some = createLearnerBelief('some');
    expect(some.stage).toEqual({
      beginner: 0.18,
      some: 0.64,
      solid: 0.18,
    });
    expect(sumStage(some.stage)).toBeCloseTo(1, 12);

    const solid = createLearnerBelief('solid');
    expect(solid.stage).toEqual({
      beginner: 0.05,
      some: 0.25,
      solid: 0.70,
    });
    expect(sumStage(solid.stage)).toBeCloseTo(1, 12);
  });

  it('does not create mastery from self-reported level alone', () => {
    const belief = createLearnerBelief('solid');
    expect(belief.mastery).toEqual({});
    expect(belief.conceptEvidence).toEqual({});
    expect(belief.knowledgeEvidenceCount).toBe(0);
    expect(belief.interactionCount).toBe(0);
  });

  it('initializes stage hysteresis from self-report only', () => {
    const belief = createLearnerBelief('some');
    expect(belief.stableLevel).toBe('some');
    expect(belief.pendingLevel).toBeNull();
    expect(belief.pendingLevelCount).toBe(0);
  });

  it('copies provided mastery without retaining a mutable reference', () => {
    const source = { vector: 0.8 };
    const belief = createLearnerBelief('some', source);
    expect(belief.mastery).toEqual({ vector: 0.8 });
    expect(belief.mastery).not.toBe(source);

    source.vector = 0.1;
    expect(belief.mastery.vector).toBe(0.8);
  });

  it('rejects invalid mastery values', () => {
    expect(() => createLearnerBelief('some', { vector: 1.2 })).toThrow();
    expect(() => createLearnerBelief('some', { vector: -0.1 })).toThrow();
    expect(() =>
      createLearnerBelief('some', { vector: Number.NaN }),
    ).toThrow();
  });

  it('exports heuristic parameter registry with key constants', () => {
    expect(LEARNER_BELIEF_PARAMS.conceptPrior).toBe(0.35);
    expect(LEARNER_BELIEF_PARAMS.stageChangeMargin).toBe(0.10);
    expect(LEARNER_BELIEF_PARAMS.requiredConsecutiveEvidence).toBe(2);
    expect(LEARNER_BELIEF_PARAMS.source.diagnostic.guess).toBeGreaterThan(0);
    expect(LEARNER_BELIEF_PARAMS.ability.solid).toBeGreaterThan(
      LEARNER_BELIEF_PARAMS.ability.beginner,
    );
  });
});

describe('applyLearnerEvidence knowledge updates', () => {
  it('diagnostic single correct from default 0.35 stays below mastery threshold', () => {
    const next = applyLearnerEvidence(
      createLearnerBelief('beginner'),
      knowledgeEvent({
        source: 'diagnostic',
        score: 1,
        confidence: 1,
      }),
    );
    expect(next.mastery.vector).toBeLessThan(MASTERY_THRESHOLD);
    expect(next.mastery.vector).toBeGreaterThan(0.35);
    expect(next.knowledgeEvidenceCount).toBe(1);
  });

  it('quick-quiz single full-score high-confidence correct crosses 0.7 from 0.35', () => {
    const next = applyLearnerEvidence(
      createLearnerBelief('beginner'),
      knowledgeEvent({
        source: 'quick-quiz',
        score: 1,
        confidence: 1,
      }),
    );
    expect(next.mastery.vector).toBeGreaterThan(MASTERY_THRESHOLD);
  });

  it('wrong answer lowers mastery', () => {
    const start = createLearnerBelief('some', { vector: 0.6 });
    const next = applyLearnerEvidence(
      start,
      knowledgeEvent({
        source: 'quick-quiz',
        score: 0,
        confidence: 1,
      }),
    );
    expect(next.mastery.vector).toBeLessThan(0.6);
  });

  it('repeated correct evidence monotonically increases mastery', () => {
    let state = createLearnerBelief('beginner', { vector: 0.35 });
    const scores: number[] = [state.mastery.vector!];
    for (let i = 0; i < 4; i += 1) {
      state = applyLearnerEvidence(
        state,
        knowledgeEvent({
          source: 'quick-quiz',
          score: 1,
          confidence: 1,
          at: 1_000 + i,
        }),
      );
      scores.push(state.mastery.vector!);
    }
    for (let i = 1; i < scores.length; i += 1) {
      expect(scores[i]).toBeGreaterThan(scores[i - 1]);
    }
  });

  it('updates only the target concept mastery', () => {
    const start = createLearnerBelief('some', {
      vector: 0.4,
      matrix: 0.55,
    });
    const next = applyLearnerEvidence(
      start,
      knowledgeEvent({ conceptId: 'vector', score: 1, confidence: 1 }),
    );
    expect(next.mastery.vector).not.toBe(0.4);
    expect(next.mastery.matrix).toBe(0.55);
  });

  it('maintains independent conceptEvidence metadata per concept', () => {
    let state = applyLearnerEvidence(
      createLearnerBelief('beginner'),
      knowledgeEvent({
        conceptId: 'vector',
        score: 1,
        confidence: 0.8,
        at: 100,
      }),
    );
    state = applyLearnerEvidence(
      state,
      knowledgeEvent({
        conceptId: 'matrix',
        score: 1,
        confidence: 0.6,
        at: 200,
      }),
    );
    state = applyLearnerEvidence(
      state,
      knowledgeEvent({
        conceptId: 'vector',
        score: 1,
        confidence: 1,
        at: 300,
      }),
    );

    expect(state.conceptEvidence.vector?.evidenceCount).toBe(2);
    expect(state.conceptEvidence.vector?.lastEvidenceAt).toBe(300);
    expect(state.conceptEvidence.vector?.reliability).toBeCloseTo(
      (0.8 + 1) / 2,
      12,
    );
    expect(state.conceptEvidence.matrix?.evidenceCount).toBe(1);
    expect(state.conceptEvidence.matrix?.lastEvidenceAt).toBe(200);
    expect(state.conceptEvidence.matrix?.reliability).toBeCloseTo(0.6, 12);
    expect(state.knowledgeEvidenceCount).toBe(3);
  });

  it('reliability is arithmetic mean of valid confidences', () => {
    let state = applyLearnerEvidence(
      createLearnerBelief('beginner'),
      knowledgeEvent({ confidence: 0.5, at: 1 }),
    );
    state = applyLearnerEvidence(
      state,
      knowledgeEvent({ confidence: 1, at: 2 }),
    );
    state = applyLearnerEvidence(
      state,
      knowledgeEvent({ confidence: 0.8, at: 3 }),
    );
    expect(state.conceptEvidence.vector?.reliability).toBeCloseTo(
      (0.5 + 1 + 0.8) / 3,
      12,
    );
  });

  it('does not let lastEvidenceAt go backwards for out-of-order timestamps', () => {
    let state = applyLearnerEvidence(
      createLearnerBelief('beginner'),
      knowledgeEvent({ at: 5_000 }),
    );
    state = applyLearnerEvidence(
      state,
      knowledgeEvent({ at: 1_000 }),
    );
    expect(state.conceptEvidence.vector?.lastEvidenceAt).toBe(5_000);
    expect(state.conceptEvidence.vector?.evidenceCount).toBe(2);
  });

  it('confidence=0 is not evidence: no counts, no meta, no mastery/stage change', () => {
    const start = applyLearnerEvidence(
      createLearnerBelief('beginner', { vector: 0.4 }),
      knowledgeEvent({ confidence: 1, at: 10 }),
    );
    const next = applyLearnerEvidence(
      start,
      knowledgeEvent({ score: 1, confidence: 0, at: 20 }),
    );
    expect(next.mastery.vector).toBe(start.mastery.vector);
    expect(next.stage).toEqual(start.stage);
    expect(next.knowledgeEvidenceCount).toBe(start.knowledgeEvidenceCount);
    expect(next.conceptEvidence).toEqual(start.conceptEvidence);
    expect(next.interactionCount).toBe(start.interactionCount);
    expect(next.stableLevel).toBe(start.stableLevel);
    expect(next.pendingLevel).toBe(start.pendingLevel);
    expect(next.pendingLevelCount).toBe(start.pendingLevelCount);
  });

  it('handles extreme 0/1 scores without NaN', () => {
    const zero = applyLearnerEvidence(
      createLearnerBelief('beginner', { vector: 0.35 }),
      knowledgeEvent({ source: 'quick-quiz', score: 0, confidence: 1, at: 1 }),
    );
    const one = applyLearnerEvidence(
      createLearnerBelief('beginner', { vector: 0.35 }),
      knowledgeEvent({ source: 'quick-quiz', score: 1, confidence: 1, at: 2 }),
    );
    expectFiniteProbability(zero.mastery.vector!);
    expectFiniteProbability(one.mastery.vector!);
    expectFiniteProbability(zero.stage.beginner);
    expectFiniteProbability(zero.stage.some);
    expectFiniteProbability(zero.stage.solid);
    expectFiniteProbability(one.stage.beginner);
    expectFiniteProbability(one.stage.some);
    expectFiniteProbability(one.stage.solid);
  });
});

describe('applyLearnerEvidence stage posterior', () => {
  it('high-confidence correct on hard knowledge raises solid posterior', () => {
    const start = createLearnerBelief('some');
    const next = applyLearnerEvidence(
      start,
      knowledgeEvent({
        source: 'quick-quiz',
        score: 1,
        confidence: 1,
        difficulty: 5,
        at: 1,
      }),
    );
    expect(next.stage.solid).toBeGreaterThan(start.stage.solid);
    expect(sumStage(next.stage)).toBeCloseTo(1, 12);
  });

  it('high-confidence wrong on easy knowledge raises beginner posterior', () => {
    const start = createLearnerBelief('some');
    const next = applyLearnerEvidence(
      start,
      knowledgeEvent({
        source: 'quick-quiz',
        score: 0,
        confidence: 1,
        difficulty: 1,
        at: 1,
      }),
    );
    expect(next.stage.beginner).toBeGreaterThan(start.stage.beginner);
    expect(sumStage(next.stage)).toBeCloseTo(1, 12);
  });

  it('normalizes stage posteriors after every knowledge update', () => {
    const next = applyLearnerEvidence(
      createLearnerBelief('solid'),
      knowledgeEvent({ score: 0.4, confidence: 0.7, difficulty: 4, at: 1 }),
    );
    expect(sumStage(next.stage)).toBeCloseTo(1, 12);
  });
});

describe('stage hysteresis', () => {
  it('never changes stableLevel on a single evidence event', () => {
    const start = createLearnerBelief('some');
    const next = applyLearnerEvidence(
      start,
      knowledgeEvent({
        source: 'quick-quiz',
        score: 1,
        confidence: 1,
        difficulty: 5,
        at: 1,
      }),
    );
    expect(next.stableLevel).toBe('some');
  });

  it('changes stableLevel only after two consecutive strong agreeing candidates', () => {
    let state = createLearnerBelief('some');
    // Multiple hard successes are required before MAP can leave "some".
    for (let i = 0; i < 4; i += 1) {
      const before = state.stableLevel;
      state = applyLearnerEvidence(
        state,
        knowledgeEvent({
          source: 'quick-quiz',
          score: 1,
          confidence: 1,
          difficulty: 5,
          conceptId: `c${i}`,
          at: i + 1,
        }),
      );
      if (i < 3) {
        expect(state.stableLevel).toBe(before);
      }
    }
    expect(state.stableLevel).toBe('solid');
    expect(state.pendingLevel).toBeNull();
    expect(state.pendingLevelCount).toBe(0);
  });

  it('restarts pending count when candidate changes', () => {
    let state = createLearnerBelief('some');
    state = applyLearnerEvidence(
      state,
      knowledgeEvent({
        source: 'quick-quiz',
        score: 1,
        confidence: 1,
        difficulty: 5,
        at: 1,
      }),
    );
    state = applyLearnerEvidence(
      state,
      knowledgeEvent({
        source: 'quick-quiz',
        score: 0,
        confidence: 1,
        difficulty: 1,
        at: 2,
      }),
    );
    // last event pushes toward beginner; if pending is beginner, count resets to 1
    expect(state.stableLevel).toBe('some');
    if (state.pendingLevel === 'beginner') {
      expect(state.pendingLevelCount).toBe(1);
    } else {
      expect(state.pendingLevelCount).toBeLessThanOrEqual(1);
    }
  });

  it('does not advance hysteresis when margin is too small', () => {
    const start = createLearnerBelief('solid');
    const next = applyLearnerEvidence(
      start,
      knowledgeEvent({
        source: 'diagnostic',
        score: 1,
        confidence: 1,
        difficulty: 3,
        at: 1,
      }),
    );
    const candidate = mostLikelyLevel(next.stage);
    if (candidate !== 'solid') {
      const advantage = next.stage[candidate] - next.stage.solid;
      if (advantage < LEARNER_BELIEF_PARAMS.stageChangeMargin) {
        expect(next.pendingLevel).toBeNull();
        expect(next.pendingLevelCount).toBe(0);
      }
    } else {
      expect(next.pendingLevel).toBeNull();
    }
    expect(next.stableLevel).toBe('solid');
  });

  it('does not advance hysteresis on confidence=0 or interaction', () => {
    let state = applyLearnerEvidence(
      createLearnerBelief('some'),
      knowledgeEvent({
        source: 'quick-quiz',
        score: 1,
        confidence: 1,
        difficulty: 5,
        at: 1,
      }),
    );
    const afterFirst = {
      pendingLevel: state.pendingLevel,
      pendingLevelCount: state.pendingLevelCount,
      stableLevel: state.stableLevel,
    };
    state = applyLearnerEvidence(
      state,
      knowledgeEvent({ confidence: 0, at: 2 }),
    );
    state = applyLearnerEvidence(state, {
      kind: 'interaction',
      source: 'navigation',
    });
    expect(state.pendingLevel).toBe(afterFirst.pendingLevel);
    expect(state.pendingLevelCount).toBe(afterFirst.pendingLevelCount);
    expect(state.stableLevel).toBe(afterFirst.stableLevel);
  });
});

describe('neutral interactions and immutability', () => {
  it('neutral interaction only increases interactionCount', () => {
    const start = createLearnerBelief('some', { vector: 0.5 });
    const next = applyLearnerEvidence(start, {
      kind: 'interaction',
      source: 'graph-select',
    });
    expect(next.interactionCount).toBe(1);
    expect(next.knowledgeEvidenceCount).toBe(0);
    expect(next.stage).toEqual(start.stage);
    expect(next.mastery).toEqual(start.mastery);
    expect(next.conceptEvidence).toEqual(start.conceptEvidence);
    expect(next.stableLevel).toBe(start.stableLevel);
    expect(next.pendingLevel).toBe(start.pendingLevel);
    expect(next.pendingLevelCount).toBe(start.pendingLevelCount);
  });

  it('does not mutate input state including nested objects', () => {
    const start = applyLearnerEvidence(
      createLearnerBelief('some', { vector: 0.4 }),
      knowledgeEvent({ source: 'quick-quiz', score: 1, confidence: 0.9, at: 1 }),
    );
    const stageSnapshot = { ...start.stage };
    const masterySnapshot = { ...start.mastery };
    const conceptSnapshot = JSON.parse(JSON.stringify(start.conceptEvidence));
    applyLearnerEvidence(
      start,
      knowledgeEvent({ source: 'quick-quiz', score: 1, confidence: 1, at: 2 }),
    );
    expect(start.stage).toEqual(stageSnapshot);
    expect(start.mastery).toEqual(masterySnapshot);
    expect(JSON.parse(JSON.stringify(start.conceptEvidence))).toEqual(
      conceptSnapshot,
    );
  });

  it('is deterministic for identical inputs', () => {
    const a = applyLearnerEvidence(
      createLearnerBelief('some', { vector: 0.4 }),
      knowledgeEvent({ source: 'open-answer', score: 0.8, confidence: 0.9, at: 5 }),
    );
    const b = applyLearnerEvidence(
      createLearnerBelief('some', { vector: 0.4 }),
      knowledgeEvent({ source: 'open-answer', score: 0.8, confidence: 0.9, at: 5 }),
    );
    expect(a).toEqual(b);
  });
});

describe('validation', () => {
  it('throws on invalid knowledge event fields', () => {
    const state = createLearnerBelief('beginner');
    expect(() =>
      applyLearnerEvidence(state, knowledgeEvent({ conceptId: '   ' })),
    ).toThrow();
    expect(() =>
      applyLearnerEvidence(state, knowledgeEvent({ score: 1.2 })),
    ).toThrow();
    expect(() =>
      applyLearnerEvidence(state, knowledgeEvent({ confidence: -0.1 })),
    ).toThrow();
    expect(() =>
      applyLearnerEvidence(state, knowledgeEvent({ difficulty: 0 })),
    ).toThrow();
    expect(() =>
      applyLearnerEvidence(state, knowledgeEvent({ difficulty: 2.5 })),
    ).toThrow();
  });

  it('throws on invalid at timestamps', () => {
    const state = createLearnerBelief('beginner');
    expect(() =>
      applyLearnerEvidence(state, knowledgeEvent({ at: -1 })),
    ).toThrow();
    expect(() =>
      applyLearnerEvidence(state, knowledgeEvent({ at: 1.5 })),
    ).toThrow();
    expect(() =>
      applyLearnerEvidence(state, knowledgeEvent({ at: Number.NaN })),
    ).toThrow();
    expect(() =>
      applyLearnerEvidence(state, knowledgeEvent({ at: Number.POSITIVE_INFINITY })),
    ).toThrow();
  });
});

describe('mostLikelyLevel', () => {
  it('returns the highest-probability stage', () => {
    expect(
      mostLikelyLevel({ beginner: 0.1, some: 0.7, solid: 0.2 }),
    ).toBe('some');
  });

  it('breaks exact ties stably beginner → some → solid', () => {
    expect(
      mostLikelyLevel({ beginner: 0.4, some: 0.4, solid: 0.2 }),
    ).toBe('beginner');
    expect(
      mostLikelyLevel({ beginner: 0.2, some: 0.4, solid: 0.4 }),
    ).toBe('some');
  });
});

import { describe, expect, it } from 'vitest';
import { diagnosticQuestions } from '../../lib/domain/diagnostic';
import {
  transformerConcepts,
} from '../../lib/domain/transformer-graph';

describe('diagnosticQuestions', () => {
  const conceptIds = new Set(transformerConcepts.map((c) => c.id));

  it('provides 5 questions', () => {
    expect(diagnosticQuestions).toHaveLength(5);
  });

  it('covers vector, matrix, probability, neural-network, attention', () => {
    const covered = new Set(diagnosticQuestions.map((q) => q.conceptId));
    for (const id of [
      'vector',
      'matrix',
      'probability',
      'neural-network',
      'attention',
    ]) {
      expect(covered.has(id), `missing diagnostic for ${id}`).toBe(true);
    }
  });

  it('uses conceptIds present in the transformer graph', () => {
    for (const question of diagnosticQuestions) {
      expect(
        conceptIds.has(question.conceptId),
        `unknown conceptId ${question.conceptId}`,
      ).toBe(true);
    }
  });

  it('has unique question ids', () => {
    const ids = diagnosticQuestions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has valid correctIndex and non-empty content', () => {
    for (const question of diagnosticQuestions) {
      expect(question.question.trim().length).toBeGreaterThan(0);
      expect(question.choices.length).toBeGreaterThanOrEqual(2);
      expect(question.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question.correctIndex).toBeLessThan(question.choices.length);
      for (const choice of question.choices) {
        expect(choice.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('spreads correct answers across at least 3 indexes', () => {
    const indexes = new Set(diagnosticQuestions.map((q) => q.correctIndex));
    expect(indexes.size).toBeGreaterThanOrEqual(3);
  });

  it('does not put every correct answer at index 0', () => {
    const allZero = diagnosticQuestions.every((q) => q.correctIndex === 0);
    expect(allZero).toBe(false);
  });
});

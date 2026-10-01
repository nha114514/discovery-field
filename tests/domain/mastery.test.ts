import { describe, expect, it } from 'vitest';
import { diagnosticMastery, updateMastery } from '../../lib/domain/mastery';

describe('updateMastery', () => {
  it('weights previous 0.4 and quiz 0.6', () => {
    expect(updateMastery(1, 0)).toBeCloseTo(0.4);
    expect(updateMastery(0, 1)).toBeCloseTo(0.6);
    expect(updateMastery(0.5, 0.5)).toBeCloseTo(0.5);
    expect(updateMastery(0.7, 0.9)).toBeCloseTo(0.4 * 0.7 + 0.6 * 0.9);
  });

  it('throws RangeError for scores outside 0..1', () => {
    expect(() => updateMastery(-0.1, 0.5)).toThrow(RangeError);
    expect(() => updateMastery(0.5, 1.1)).toThrow(RangeError);
    expect(() => updateMastery(Number.NaN, 0.5)).toThrow(RangeError);
  });
});

describe('diagnosticMastery', () => {
  it('returns 0.75 for correct answers', () => {
    expect(diagnosticMastery(true)).toBe(0.75);
  });

  it('returns 0.35 for incorrect answers', () => {
    expect(diagnosticMastery(false)).toBe(0.35);
  });
});

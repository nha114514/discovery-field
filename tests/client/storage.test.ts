import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  saveSession,
  loadSession,
  clearSession,
  getSessionKey,
  STORAGE_VERSION,
  type SessionState,
} from '../../lib/client/storage';
import { createDefaultIntake } from '../../lib/domain/learner-intake';
import { createLearnerBelief } from '../../lib/domain/learner-belief';

describe('localStorage session persistence', () => {
  const goal = 'Transformer';
  const goalKey = getSessionKey(goal);

  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    const ls: Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'clear'> = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => { mockStorage[key] = String(value); },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => { mockStorage = {}; },
    };

    Object.defineProperty(global, 'window', {
      value: { localStorage: ls },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  function createValidState(): Omit<SessionState, 'version' | 'goal'> {
    return {
      step: 'route',
      intake: createDefaultIntake(),
      learnerBelief: createLearnerBelief('beginner'),
      activeConceptId: null,
    };
  }

  function injectState(overrides: Record<string, unknown>) {
    const base = createValidState();
    const full = { ...base, version: STORAGE_VERSION, goal: 'transformer', ...overrides };
    window.localStorage.setItem(goalKey, JSON.stringify(full));
  }

  it('generates normalized keys based on goal', () => {
    expect(getSessionKey('Transformer')).toBe('gibc_v2_session_transformer');
    expect(getSessionKey('  TRANSFORMER  ')).toBe('gibc_v2_session_transformer');
  });

  it('saves and loads a valid session', () => {
    const state = createValidState();
    saveSession(goal, state);

    const loaded = loadSession(goal);
    expect(loaded).toBeDefined();
    expect(loaded?.step).toBe('route');
    expect(loaded?.version).toBe(STORAGE_VERSION);
    expect(loaded?.goal).toBe('transformer');
  });

  it('returns null if no session exists', () => {
    const loaded = loadSession(goal);
    expect(loaded).toBeNull();
  });

  it('clears session successfully', () => {
    const state = createValidState();
    saveSession(goal, state);
    expect(loadSession(goal)).not.toBeNull();

    clearSession(goal);
    expect(loadSession(goal)).toBeNull();
  });

  it('rejects unknown top-level fields', () => {
    injectState({ unknownField: true });
    expect(loadSession(goal)).toBeNull();
  });

  it('rejects unknown nested fields', () => {
    injectState({
      intake: {
        ...createDefaultIntake(),
        unknownNested: 'yes'
      }
    });
    expect(loadSession(goal)).toBeNull();
  });

  it('rejects unknown step', () => {
    injectState({ step: 'unknown-step-name' });
    expect(loadSession(goal)).toBeNull();
  });

  it('rejects probability below 0 or above 1', () => {
    const base = createValidState();
    injectState({
      learnerBelief: {
        ...base.learnerBelief,
        stage: { ...base.learnerBelief.stage, beginner: 1.5 }
      }
    });
    expect(loadSession(goal)).toBeNull();

    injectState({
      learnerBelief: {
        ...base.learnerBelief,
        stage: { ...base.learnerBelief.stage, some: -0.1 }
      }
    });
    expect(loadSession(goal)).toBeNull();
  });

  it('rejects fractional or negative counts', () => {
    const base = createValidState();
    injectState({
      learnerBelief: {
        ...base.learnerBelief,
        interactionCount: 1.5
      }
    });
    expect(loadSession(goal)).toBeNull();

    injectState({
      learnerBelief: {
        ...base.learnerBelief,
        knowledgeEvidenceCount: -1
      }
    });
    expect(loadSession(goal)).toBeNull();
  });

  it('rejects invalid timestamps', () => {
    const base = createValidState();
    injectState({
      learnerBelief: {
        ...base.learnerBelief,
        conceptEvidence: {
          'numbers': { evidenceCount: 1, reliability: 1, lastEvidenceAt: -100 }
        }
      }
    });
    expect(loadSession(goal)).toBeNull();
  });

  it('rejects unknown mastery/conceptEvidence IDs', () => {
    const base = createValidState();
    injectState({
      learnerBelief: {
        ...base.learnerBelief,
        mastery: { 'invalid-concept-id': 1 }
      }
    });
    expect(loadSession(goal)).toBeNull();
  });

  it('rejects and removes session if activeConceptId is an unknown concept', () => {
    injectState({ activeConceptId: 'not-a-transformer-concept' });

    // loadSession should return null and remove the entry
    expect(loadSession(goal)).toBeNull();
    expect(window.localStorage.getItem(goalKey)).toBeNull();
  });

  it('rejects and removes session with older or mismatched version', () => {
    injectState({ version: 999 });
    expect(loadSession(goal)).toBeNull();
    expect(window.localStorage.getItem(goalKey)).toBeNull();
  });

  it('rejects and removes session if goal does not match', () => {
    injectState({ goal: 'other' });
    expect(loadSession(goal)).toBeNull();
    expect(window.localStorage.getItem(goalKey)).toBeNull();
  });

  it('handles localStorage exceptions gracefully during load', () => {
    const originalGetItem = window.localStorage.getItem;
    window.localStorage.getItem = () => { throw new Error('QuotaExceeded'); };
    expect(loadSession(goal)).toBeNull();
    window.localStorage.getItem = originalGetItem;
  });

  it('handles localStorage exceptions gracefully during save', () => {
    const originalSetItem = window.localStorage.setItem;
    window.localStorage.setItem = () => { throw new Error('QuotaExceeded'); };
    expect(() => saveSession(goal, createValidState())).not.toThrow();
    window.localStorage.setItem = originalSetItem;
  });

  it('handles localStorage exceptions gracefully during removeItem', () => {
    const originalRemoveItem = window.localStorage.removeItem;
    window.localStorage.removeItem = () => { throw new Error('SecurityError'); };
    expect(() => clearSession(goal)).not.toThrow();

    // loadSession also attempts to remove on invalid schema
    injectState({ version: 999 });
    expect(() => loadSession(goal)).not.toThrow();
    expect(loadSession(goal)).toBeNull();

    window.localStorage.removeItem = originalRemoveItem;
  });
});

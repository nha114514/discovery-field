import { describe, expect, it } from 'vitest';
import {
  answerModes,
  canContinueIntake,
  createDefaultIntake,
  type AnswerMode,
} from '../../lib/domain/learner-intake';
import { copy, normalizeLocale, otherLocale } from '../../lib/i18n/copy';
import {
  buildLocaleUrl,
  htmlLangForLocale,
  withLocaleQuery,
} from '../../lib/i18n/locale-url';
import {
  DIAGNOSTIC_CORRECT_EVIDENCE,
  MASTERY_THRESHOLD,
  diagnosticEvidenceScore,
} from '../../lib/domain/mastery';
import { buildLearningPath } from '../../lib/domain/learning-path';
import {
  transformerConcepts,
  transformerEdges,
} from '../../lib/domain/transformer-graph';

describe('entry copy', () => {
  it('has complete zh and en dictionaries', () => {
    for (const locale of ['zh', 'en'] as const) {
      const c = copy[locale];
      expect(c.home.title.length).toBeGreaterThan(0);
      expect(c.home.intro.length).toBeGreaterThan(0);
      expect(c.home.goalPlaceholder.length).toBeGreaterThan(0);
      expect(c.prefs.honestyNotice.length).toBeGreaterThan(0);
      expect(c.prefs.outcomeLabel.length).toBeGreaterThan(0);
      expect(c.prefs.priorLabel.length).toBeGreaterThan(0);
      expect(c.challenge.start.length).toBeGreaterThan(0);
      expect(c.challenge.skip.length).toBeGreaterThan(0);
      expect(c.challenge.introBody).toContain(
        locale === 'zh' ? '不会单独决定' : 'will not decide',
      );
      expect(c.diagnostics).toHaveLength(5);
      for (const item of c.diagnostics) {
        expect(item.question.length).toBeGreaterThan(0);
        expect(item.choices.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('gives every AnswerMode a zh/en label and prompt', () => {
    for (const mode of answerModes) {
      for (const locale of ['zh', 'en'] as const) {
        const entry = copy[locale].answerModes[mode as AnswerMode];
        expect(entry.label.length).toBeGreaterThan(0);
        expect(entry.prompt.length).toBeGreaterThan(0);
      }
    }
  });

  it('keeps honesty notices distinct by locale', () => {
    expect(copy.zh.prefs.honestyNotice).not.toBe(copy.en.prefs.honestyNotice);
    expect(copy.zh.prefs.honestyNotice).toContain('如实填写');
    expect(copy.en.prefs.honestyNotice).toContain('answer honestly');
  });
});

describe('locale URL helpers', () => {
  it('normalizes locale values', () => {
    expect(normalizeLocale('en')).toBe('en');
    expect(normalizeLocale('zh')).toBe('zh');
    expect(normalizeLocale(undefined)).toBe('zh');
    expect(otherLocale('zh')).toBe('en');
    expect(otherLocale('en')).toBe('zh');
  });

  it('maps locale to html lang attribute', () => {
    expect(htmlLangForLocale('zh')).toBe('zh-CN');
    expect(htmlLangForLocale('en')).toBe('en');
  });

  it('updates locale query while preserving goal and other params', () => {
    const search = '?goal=Transformer&locale=en&utm=demo';
    const nextQuery = withLocaleQuery(search, 'zh');
    const params = new URLSearchParams(nextQuery);
    expect(params.get('goal')).toBe('Transformer');
    expect(params.get('locale')).toBe('zh');
    expect(params.get('utm')).toBe('demo');
  });

  it('builds full URL with pathname and updated locale', () => {
    const url = buildLocaleUrl('/learn', '?goal=Fourier&locale=zh', 'en');
    expect(url.startsWith('/learn?')).toBe(true);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('goal')).toBe('Fourier');
    expect(params.get('locale')).toBe('en');
  });

  it('adds locale when missing without dropping other keys', () => {
    const query = withLocaleQuery('?goal=TCP', 'en');
    const params = new URLSearchParams(query);
    expect(params.get('goal')).toBe('TCP');
    expect(params.get('locale')).toBe('en');
  });
});

describe('canContinueIntake', () => {
  it('allows continue when unsure, even with empty freeform', () => {
    const intake = {
      ...createDefaultIntake(),
      answerMode: 'unsure' as const,
      learningOutcome: '',
      priorKnowledgeAndConfusion: '',
    };
    expect(canContinueIntake(intake)).toBe(true);
  });

  it('allows continue with any non-empty freeform field', () => {
    const intake = {
      ...createDefaultIntake(),
      answerMode: 'freeform' as const,
      learningOutcome: '我想看懂注意力',
      priorKnowledgeAndConfusion: '',
    };
    expect(canContinueIntake(intake)).toBe(true);
  });
});

describe('diagnostic evidence scoring', () => {
  it('never reaches mastery threshold from a single correct choice', () => {
    expect(diagnosticEvidenceScore(true)).toBeLessThan(MASTERY_THRESHOLD);
    expect(DIAGNOSTIC_CORRECT_EVIDENCE).toBeLessThan(MASTERY_THRESHOLD);
  });
});

describe('skip challenge path generation', () => {
  it('builds a full 25-step path with empty mastery when challenge is skipped', () => {
    const path = buildLearningPath({
      targetId: 'transformer',
      concepts: transformerConcepts,
      edges: transformerEdges,
      mastery: {},
    });
    expect(path).toHaveLength(25);
    expect(path[path.length - 1]).toBe('transformer');
  });
});

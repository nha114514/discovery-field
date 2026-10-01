import { describe, expect, it } from 'vitest';
import type { ExplanationStyle, Level } from '../../lib/domain/learner-intake';
import type {
  ContentDensity,
  LessonSectionKey,
  ResolveLessonPresentationParams,
} from '../../lib/domain/lesson-presentation';
import {
  DEFAULT_DENSITY_BY_LEVEL,
  LESSON_SECTION_ORDER_BY_STYLE,
  defaultDensityForLevel,
  resolveLessonPresentation,
} from '../../lib/domain/lesson-presentation';

describe('lesson-presentation policy', () => {
  describe('defaultDensityForLevel & stableLevel mapping', () => {
    it('maps beginner to focused', () => {
      expect(defaultDensityForLevel('beginner')).toBe('focused');
      const presentation = resolveLessonPresentation({
        stableLevel: 'beginner',
        explanationStyle: 'story',
      });
      expect(presentation.density).toBe('focused');
      expect(presentation.isOverridden).toBe(false);
    });

    it('maps some to balanced', () => {
      expect(defaultDensityForLevel('some')).toBe('balanced');
      const presentation = resolveLessonPresentation({
        stableLevel: 'some',
        explanationStyle: 'visual',
      });
      expect(presentation.density).toBe('balanced');
      expect(presentation.isOverridden).toBe(false);
    });

    it('maps solid to deep', () => {
      expect(defaultDensityForLevel('solid')).toBe('deep');
      const presentation = resolveLessonPresentation({
        stableLevel: 'solid',
        explanationStyle: 'rigorous',
      });
      expect(presentation.density).toBe('deep');
      expect(presentation.isOverridden).toBe(false);
    });

    it('matches DEFAULT_DENSITY_BY_LEVEL constants', () => {
      expect(DEFAULT_DENSITY_BY_LEVEL).toEqual({
        beginner: 'focused',
        some: 'balanced',
        solid: 'deep',
      });
    });
  });

  describe('explanation styles section ordering', () => {
    it('reproduces story ordering: explanation -> example -> rigorous -> mistake', () => {
      expect(LESSON_SECTION_ORDER_BY_STYLE.story).toEqual([
        'explanation',
        'example',
        'rigorous',
        'mistake',
      ]);
    });

    it('reproduces visual ordering: explanation -> example -> rigorous -> mistake', () => {
      expect(LESSON_SECTION_ORDER_BY_STYLE.visual).toEqual([
        'explanation',
        'example',
        'rigorous',
        'mistake',
      ]);
    });

    it('reproduces rigorous ordering: explanation -> rigorous -> example -> mistake', () => {
      expect(LESSON_SECTION_ORDER_BY_STYLE.rigorous).toEqual([
        'explanation',
        'rigorous',
        'example',
        'mistake',
      ]);
    });
  });

  describe('focused density behavior', () => {
    const styles: ExplanationStyle[] = ['story', 'visual', 'rigorous'];

    it.each(styles)('has exactly 1 visible section (explanation) and 3 hidden sections for style %s', (style) => {
      const presentation = resolveLessonPresentation({
        stableLevel: 'beginner',
        explanationStyle: style,
      });

      expect(presentation.density).toBe('focused');
      expect(presentation.visibleSections).toEqual(['explanation']);
      expect(presentation.hiddenSections).toHaveLength(3);
      expect(presentation.hiddenSections).not.toContain('explanation');
    });
  });

  describe('balanced density behavior', () => {
    const styles: ExplanationStyle[] = ['story', 'visual', 'rigorous'];

    it.each(styles)('has exactly 2 visible sections (explanation and example) and 2 hidden sections for style %s', (style) => {
      const presentation = resolveLessonPresentation({
        stableLevel: 'some',
        explanationStyle: style,
      });

      expect(presentation.density).toBe('balanced');
      expect(presentation.visibleSections).toEqual(['explanation', 'example']);
      expect(presentation.hiddenSections).toHaveLength(2);
      expect(presentation.hiddenSections).toEqual(['rigorous', 'mistake']);
    });
  });

  describe('deep density behavior', () => {
    const styles: ExplanationStyle[] = ['story', 'visual', 'rigorous'];

    it.each(styles)('has exactly 4 visible sections and 0 hidden sections for style %s', (style) => {
      const presentation = resolveLessonPresentation({
        stableLevel: 'solid',
        explanationStyle: style,
      });

      expect(presentation.density).toBe('deep');
      expect(presentation.visibleSections).toHaveLength(4);
      expect(presentation.hiddenSections).toHaveLength(0);
      expect(presentation.visibleSections).toEqual(
        LESSON_SECTION_ORDER_BY_STYLE[style],
      );
    });
  });

  describe('partition invariant across all styles and densities', () => {
    const levels: Level[] = ['beginner', 'some', 'solid'];
    const styles: ExplanationStyle[] = ['story', 'visual', 'rigorous'];
    const densities: ContentDensity[] = ['focused', 'balanced', 'deep'];

    const combinations: Array<{
      level: Level;
      style: ExplanationStyle;
      override?: ContentDensity;
    }> = [];

    for (const level of levels) {
      for (const style of styles) {
        combinations.push({ level, style });
        for (const override of densities) {
          combinations.push({ level, style, override });
        }
      }
    }

    it.each(combinations)(
      'forms a complete duplicate-free partition preserving style order for level: $level, style: $style, override: $override',
      ({ level, style, override }) => {
        const presentation = resolveLessonPresentation({
          stableLevel: level,
          explanationStyle: style,
          overrideDensity: override,
        });

        const fullStyleOrder = LESSON_SECTION_ORDER_BY_STYLE[style];

        // Total count check
        expect(
          presentation.visibleSections.length +
            presentation.hiddenSections.length,
        ).toBe(4);

        // No duplicates within visible
        expect(new Set(presentation.visibleSections).size).toBe(
          presentation.visibleSections.length,
        );

        // No duplicates within hidden
        expect(new Set(presentation.hiddenSections).size).toBe(
          presentation.hiddenSections.length,
        );

        // Complete partition of all 4 sections
        const combined = [
          ...presentation.visibleSections,
          ...presentation.hiddenSections,
        ];
        expect(new Set(combined).size).toBe(4);
        for (const section of fullStyleOrder) {
          expect(combined).toContain(section);
        }

        // Relative ordering preserved in visibleSections
        const visibleIndices = presentation.visibleSections.map((s) =>
          fullStyleOrder.indexOf(s),
        );
        const sortedVisibleIndices = [...visibleIndices].sort((a, b) => a - b);
        expect(visibleIndices).toEqual(sortedVisibleIndices);

        // Relative ordering preserved in hiddenSections
        const hiddenIndices = presentation.hiddenSections.map((s) =>
          fullStyleOrder.indexOf(s),
        );
        const sortedHiddenIndices = [...hiddenIndices].sort((a, b) => a - b);
        expect(hiddenIndices).toEqual(sortedHiddenIndices);
      },
    );
  });

  describe('manual override behavior', () => {
    it('manual override wins over stableLevel without mutating input', () => {
      const params: ResolveLessonPresentationParams = {
        stableLevel: 'beginner',
        explanationStyle: 'story',
        overrideDensity: 'deep',
      };

      const presentation = resolveLessonPresentation(params);

      expect(presentation.density).toBe('deep');
      expect(presentation.isOverridden).toBe(true);
      expect(presentation.visibleSections).toHaveLength(4);
      expect(params.stableLevel).toBe('beginner');
    });

    it('manual override to focused wins for solid stableLevel', () => {
      const presentation = resolveLessonPresentation({
        stableLevel: 'solid',
        explanationStyle: 'visual',
        overrideDensity: 'focused',
      });

      expect(presentation.density).toBe('focused');
      expect(presentation.isOverridden).toBe(true);
      expect(presentation.visibleSections).toEqual(['explanation']);
    });

    it('manual override with identical density sets isOverridden to true', () => {
      const presentation = resolveLessonPresentation({
        stableLevel: 'beginner',
        explanationStyle: 'story',
        overrideDensity: 'focused',
      });

      expect(presentation.density).toBe('focused');
      expect(presentation.isOverridden).toBe(true);
    });

    it('explicit undefined or null override falls back to stableLevel with isOverridden false', () => {
      const withUndefined = resolveLessonPresentation({
        stableLevel: 'some',
        explanationStyle: 'story',
        overrideDensity: undefined,
      });
      expect(withUndefined.density).toBe('balanced');
      expect(withUndefined.isOverridden).toBe(false);

      const withNull = resolveLessonPresentation({
        stableLevel: 'some',
        explanationStyle: 'story',
        overrideDensity: null,
      });
      expect(withNull.density).toBe('balanced');
      expect(withNull.isOverridden).toBe(false);
    });
  });

  describe('immutability and fresh array instances', () => {
    it('returns fresh arrays on repeated calls', () => {
      const first = resolveLessonPresentation({
        stableLevel: 'beginner',
        explanationStyle: 'story',
      });
      const second = resolveLessonPresentation({
        stableLevel: 'beginner',
        explanationStyle: 'story',
      });

      expect(first.visibleSections).not.toBe(second.visibleSections);
      expect(first.hiddenSections).not.toBe(second.hiddenSections);
      expect(first.visibleSections).toEqual(second.visibleSections);
      expect(first.hiddenSections).toEqual(second.hiddenSections);
    });

    it('mutating returned arrays does not affect subsequent calls or shared constants', () => {
      const first = resolveLessonPresentation({
        stableLevel: 'beginner',
        explanationStyle: 'story',
      });

      // Mutate the returned arrays
      first.visibleSections.push('mistake' as LessonSectionKey);
      first.hiddenSections.length = 0;

      const second = resolveLessonPresentation({
        stableLevel: 'beginner',
        explanationStyle: 'story',
      });

      expect(second.visibleSections).toHaveLength(1);
      expect(second.hiddenSections).toHaveLength(3);
      expect(second.visibleSections).toEqual(['explanation']);

      // Shared constant remains intact
      expect(LESSON_SECTION_ORDER_BY_STYLE.story).toHaveLength(4);
    });
  });
});

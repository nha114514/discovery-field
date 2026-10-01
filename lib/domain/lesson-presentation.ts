import type { Level, ExplanationStyle } from './learner-intake';

// These mappings are MVP presentation heuristics, not research-calibrated learner classifications.

export type ContentDensity = 'focused' | 'balanced' | 'deep';

export type LessonSectionKey =
  | 'explanation'
  | 'example'
  | 'rigorous'
  | 'mistake';

export const LESSON_SECTION_ORDER_BY_STYLE = Object.freeze({
  story: Object.freeze([
    'explanation',
    'example',
    'rigorous',
    'mistake',
  ] as const),
  visual: Object.freeze([
    'explanation',
    'example',
    'rigorous',
    'mistake',
  ] as const),
  rigorous: Object.freeze([
    'explanation',
    'rigorous',
    'example',
    'mistake',
  ] as const),
}) satisfies Record<ExplanationStyle, readonly LessonSectionKey[]>;

export const DEFAULT_DENSITY_BY_LEVEL: Readonly<Record<Level, ContentDensity>> =
  Object.freeze({
    beginner: 'focused',
    some: 'balanced',
    solid: 'deep',
  });

export interface LessonPresentation {
  density: ContentDensity;
  visibleSections: LessonSectionKey[];
  hiddenSections: LessonSectionKey[];
  isOverridden: boolean;
}

export interface ResolveLessonPresentationParams {
  stableLevel: Level;
  explanationStyle: ExplanationStyle;
  overrideDensity?: ContentDensity | null;
}

export function defaultDensityForLevel(level: Level): ContentDensity {
  return DEFAULT_DENSITY_BY_LEVEL[level];
}

export function resolveLessonPresentation({
  stableLevel,
  explanationStyle,
  overrideDensity,
}: ResolveLessonPresentationParams): LessonPresentation {
  const isOverridden = overrideDensity !== undefined && overrideDensity !== null;
  const density = isOverridden ? overrideDensity : defaultDensityForLevel(stableLevel);

  const fullOrder = LESSON_SECTION_ORDER_BY_STYLE[explanationStyle];

  let visibleSet: Set<LessonSectionKey>;

  switch (density) {
    case 'focused': {
      visibleSet = new Set<LessonSectionKey>(['explanation']);
      break;
    }
    case 'balanced': {
      visibleSet = new Set<LessonSectionKey>(['explanation', 'example']);
      break;
    }
    case 'deep': {
      visibleSet = new Set<LessonSectionKey>(fullOrder);
      break;
    }
  }

  const visibleSections = fullOrder.filter((section) => visibleSet.has(section));
  const hiddenSections = fullOrder.filter((section) => !visibleSet.has(section));

  return {
    density,
    visibleSections,
    hiddenSections,
    isOverridden,
  };
}

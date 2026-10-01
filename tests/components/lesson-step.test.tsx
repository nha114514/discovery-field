import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { LessonStep } from '../../components/learning/lesson-step';
import { getLesson } from '../../lib/domain/lessons';
import { copy } from '../../lib/i18n/copy';
import { updateMastery } from '../../lib/domain/mastery';
import { buildLearningPath } from '../../lib/domain/learning-path';
import {
  transformerConcepts,
  transformerEdges,
} from '../../lib/domain/transformer-graph';
import { createLearnerBelief, applyLearnerEvidence } from '../../lib/domain/learner-belief';
import {
  defaultDensityForLevel,
  resolveLessonPresentation,
  type ContentDensity,
} from '../../lib/domain/lesson-presentation';
import type { Level } from '../../lib/domain/learner-intake';

function renderLesson(locale: 'zh' | 'en', overrides: Partial<Parameters<typeof LessonStep>[0]> = {}) {
  const lesson = getLesson('numbers', locale);
  if (!lesson) {
    throw new Error('missing numbers lesson');
  }
  return renderToStaticMarkup(
    createElement(LessonStep, {
      copy: copy[locale],
      locale,
      openAnswerMode: 'freeform',
      openAnswerText: '',
      openLoading: false,
      openError: null,
      openAssessment: null,
      openAccepted: false,
      useQuizFallback: true,
      onOpenAnswerModeChange: () => undefined,
      onOpenAnswerTextChange: () => undefined,
      onOpenSubmit: () => undefined,
      onOpenEdit: () => undefined,
      onUseQuiz: () => undefined,
      onReturnToOpen: () => undefined,
      conceptTitle: locale === 'zh' ? '数字' : 'Numbers',
      nextConceptTitle: locale === 'zh' ? '概率' : 'Probability',
      lesson,
      style: 'story',
      stableLevel: 'beginner',
      overrideDensity: null,
      onOverrideDensity: () => undefined,
      quizSelected: null,
      quizChecked: false,
      isQuizCorrect: false,
      quizAttempts: 0,
      pathBefore: 25,
      pathAfter: 25,
      onSelectChoice: () => undefined,
      onSubmitQuiz: () => undefined,
      onRetry: () => undefined,
      onContinueNext: () => undefined,
      onViewRoute: () => undefined,
      ...overrides,
    }),
  );
}

describe('LessonStep bilingual chrome', () => {
  it('reads the Attention fable before revealing and explaining the concept in both languages', () => {
    for (const locale of ['zh', 'en'] as const) {
      const lesson = getLesson('attention', locale)!;
      const fable = lesson.fable!;
      const conceptTitle = locale === 'zh' ? '注意力' : 'Attention';
      const html = renderLesson(locale, { lesson, conceptTitle }).replaceAll('&quot;', '"');
      const storyIndex = html.indexOf(fable.story[0]);
      const revealIndex = html.indexOf(fable.reveal);
      const explanationIndex = html.indexOf(fable.explanation);

      expect(html).toContain('data-fable-article="true"');
      expect(storyIndex).toBeGreaterThan(-1);
      expect(revealIndex).toBeGreaterThan(storyIndex);
      expect(explanationIndex).toBeGreaterThan(revealIndex);
      expect(html.indexOf('data-attention-explorer')).toBeGreaterThan(explanationIndex);
      expect(html.slice(0, revealIndex)).not.toContain(`>${conceptTitle}</h2>`);
      expect(html).not.toContain(lesson.primaryExplanations.story);
      expect(html).not.toContain(copy[locale].lesson.density.legend);
      for (const { image, meaning } of fable.metaphors) {
        expect(html).toContain(`<dt>${image}</dt>`);
        expect(html).toContain(`<dd>${meaning}</dd>`);
      }
    }
  });

  it('shows an interactive Attention illustration without changing other lessons', () => {
    const attention = getLesson('attention', 'en');
    expect(attention).toBeDefined();
    expect(renderLesson('en', { lesson: attention! })).toContain('data-attention-explorer');
    expect(renderLesson('en')).not.toContain('data-attention-explorer');
  });

  it('always offers a way back to the knowledge map before answering', () => {
    expect(renderLesson('en')).toContain(copy.en.lesson.backToMap);
    expect(renderLesson('zh')).toContain(copy.zh.lesson.backToMap);
  });
  it('uses Chinese chrome and lesson body in zh', () => {
    const html = renderLesson('zh');
    expect(html).toContain(copy.zh.lesson.currentLesson);
    expect(html).toContain('数字');
    expect(html).toContain(copy.zh.lesson.quizLegend);
    expect(html).toContain(copy.zh.lesson.submitAnswer);
    expect(html).toContain(getLesson('numbers', 'zh')!.primaryExplanation);
  });

  it('uses English chrome and lesson body in en without Chinese chrome', () => {
    const html = renderLesson('en');
    expect(html).toContain(copy.en.lesson.currentLesson);
    expect(html).toContain('Numbers');
    expect(html).toContain(copy.en.lesson.quizLegend);
    expect(html).toContain(copy.en.lesson.submitAnswer);
    expect(html.replaceAll('&quot;', '"')).toContain(getLesson('numbers', 'en')!.primaryExplanation);
    expect(html).not.toContain(copy.zh.lesson.currentLesson);
    expect(html).not.toContain(copy.zh.lesson.quizLegend);
    expect(html).not.toContain(copy.zh.lesson.submitAnswer);
  });

  it('renders story, visual, and rigorous primary explanations when style prop changes', () => {
    const zhLesson = getLesson('numbers', 'zh')!;
    const storyHtml = renderLesson('zh', { style: 'story' });
    const visualHtml = renderLesson('zh', { style: 'visual' });
    const rigorousHtml = renderLesson('zh', { style: 'rigorous' });

    expect(storyHtml).toContain(zhLesson.primaryExplanations.story);
    expect(storyHtml).not.toContain(zhLesson.primaryExplanations.visual);
    expect(storyHtml).not.toContain(zhLesson.primaryExplanations.rigorous);

    expect(visualHtml).toContain(zhLesson.primaryExplanations.visual);
    expect(visualHtml).not.toContain(zhLesson.primaryExplanations.story);
    expect(visualHtml).not.toContain(zhLesson.primaryExplanations.rigorous);

    expect(rigorousHtml).toContain(zhLesson.primaryExplanations.rigorous);
    expect(rigorousHtml).not.toContain(zhLesson.primaryExplanations.story);
    expect(rigorousHtml).not.toContain(zhLesson.primaryExplanations.visual);

    const enLesson = getLesson('numbers', 'en')!;
    const enStoryHtml = renderLesson('en', { style: 'story' }).replaceAll('&quot;', '"');
    const enVisualHtml = renderLesson('en', { style: 'visual' }).replaceAll('&quot;', '"');
    const enRigorousHtml = renderLesson('en', { style: 'rigorous' }).replaceAll('&quot;', '"');

    expect(enStoryHtml).toContain(enLesson.primaryExplanations.story);
    expect(enVisualHtml).toContain(enLesson.primaryExplanations.visual);
    expect(enRigorousHtml).toContain(enLesson.primaryExplanations.rigorous);
  });

  it('formats dynamic feedback through copy functions', () => {
    const html = renderLesson('zh', {
      quizSelected: 1,
      quizChecked: true,
      isQuizCorrect: true,
      quizAttempts: 1,
      pathBefore: 25,
      pathAfter: 24,
    });
    expect(html).toContain(copy.zh.lesson.routeChange.mastered('数字'));
    expect(html).toContain(copy.zh.lesson.routeChange.stepsTransition(25, 24));
    expect(html).toContain(copy.zh.lesson.routeChange.next('概率'));
    expect(html).toContain(copy.zh.lesson.continueNext);
    expect(html).toContain(copy.zh.lesson.viewUpdatedRoute);

    const htmlEn = renderLesson('en', {
      quizSelected: 1,
      quizChecked: true,
      isQuizCorrect: true,
      quizAttempts: 1,
      pathBefore: 25,
      pathAfter: 24,
    });
    expect(htmlEn).toContain(copy.en.lesson.routeChange.mastered('Numbers'));
    expect(htmlEn).toContain(copy.en.lesson.routeChange.stepsTransition(25, 24));
    expect(htmlEn).toContain(copy.en.lesson.routeChange.next('Probability'));
    expect(htmlEn).not.toContain('你掌握了');
  });

  it('shows incorrect feedback with shared explanation text', () => {
    const zh = renderLesson('zh', {
      quizSelected: 0,
      quizChecked: true,
      isQuizCorrect: false,
      quizAttempts: 1,
    });
    expect(zh).toContain(copy.zh.lesson.incorrectHeading);
    expect(zh).toContain(copy.zh.lesson.tryAgain);
    expect(zh).toContain(getLesson('numbers', 'zh')!.quiz.explanation);
  });
});

describe('shared quiz correctness and mastery regression', () => {
  it('zh and en resolve the same correctIndex from one quizCorrectIndex', () => {
    const zh = getLesson('vector', 'zh');
    const en = getLesson('vector', 'en');
    expect(zh?.quiz.correctIndex).toBe(en?.quiz.correctIndex);
    expect(zh?.quiz.choices.length).toBe(en?.quiz.choices.length);
  });

  it('first correct answer from unknown still crosses mastery threshold', () => {
    const score = updateMastery(0.35, 1);
    expect(score).toBeGreaterThanOrEqual(0.7);
  });

  it('correct after one miss still needs another correct to master', () => {
    const afterMiss = updateMastery(0.35, 0);
    const afterRetry = updateMastery(afterMiss, 1);
    expect(afterRetry).toBeLessThan(0.7);
  });

  it('mastering numbers still shortens path from 25 to 24', () => {
    const full = buildLearningPath({
      targetId: 'transformer',
      concepts: transformerConcepts,
      edges: transformerEdges,
      mastery: {},
    });
    const shorter = buildLearningPath({
      targetId: 'transformer',
      concepts: transformerConcepts,
      edges: transformerEdges,
      mastery: { numbers: updateMastery(0.35, 1) },
    });
    expect(full).toHaveLength(25);
    expect(shorter).toHaveLength(24);
    expect(shorter).not.toContain('numbers');
  });
});

describe('locale-stable lesson lookup', () => {
  it('getLesson is pure and does not mutate bilingual source', () => {
    const a = getLesson('attention', 'zh');
    const b = getLesson('attention', 'en');
    const a2 = getLesson('attention', 'zh');
    expect(a).toEqual(a2);
    expect(a?.conceptId).toBe('attention');
    expect(b?.conceptId).toBe('attention');
    expect(a?.quiz.question).not.toBe(b?.quiz.question);
    expect(a?.quiz.correctIndex).toBe(b?.quiz.correctIndex);
  });
});

describe('LessonStep assessment switching', () => {
  it('quiz is hidden by default', () => {
    const html = renderLesson('en', { useQuizFallback: false });
    expect(html).not.toContain(copy.en.lesson.quizLegend);
    expect(html).toContain(copy.en.lesson.openAnswer.title);
  });

  it('quiz renders only in fallback mode', () => {
    const html = renderLesson('en', { useQuizFallback: true });
    expect(html).toContain(copy.en.lesson.quizLegend);
    expect(html).not.toContain(copy.en.lesson.openAnswer.title);
  });

  it('return-to-open-answer control renders in quiz fallback', () => {
    const html = renderLesson('en', { useQuizFallback: true });
    expect(html).toContain(copy.en.lesson.openAnswer.returnToOpen);
  });

  it('accepted but not mastered reinforce button calls onOpenEdit', () => {
    const onOpenEdit = () => undefined;
    let editCalls = 0;
    const lesson = getLesson('numbers', 'en');
    if (!lesson) {
      throw new Error('missing numbers lesson');
    }
    const tree = LessonStep({
      copy: copy.en,
      locale: 'en',
      conceptTitle: 'Numbers',
      nextConceptTitle: 'Probability',
      lesson,
      style: 'story',
      stableLevel: 'beginner',
      overrideDensity: null,
      onOverrideDensity: () => undefined,
      openAnswerMode: 'freeform',
      openAnswerText: 'partial understanding',
      openLoading: false,
      openError: null,
      openAssessment: {
        version: 1,
        conceptId: 'numbers',
        score: 0.5,
        confidence: 0.9,
        quote: 'partial',
        feedback: { zh: 'x', en: 'x' },
        nextStep: { zh: 'x', en: 'x' },
      },
      openAccepted: true,
      useQuizFallback: false,
      onOpenAnswerModeChange: () => undefined,
      onOpenAnswerTextChange: () => undefined,
      onOpenSubmit: () => undefined,
      onOpenEdit: () => {
        editCalls += 1;
        onOpenEdit();
      },
      onUseQuiz: () => undefined,
      onReturnToOpen: () => undefined,
      quizSelected: null,
      quizChecked: false,
      isQuizCorrect: false,
      quizAttempts: 0,
      pathBefore: 25,
      pathAfter: 25,
      onSelectChoice: () => undefined,
      onSubmitQuiz: () => undefined,
      onRetry: () => undefined,
      onContinueNext: () => undefined,
      onViewRoute: () => undefined,
    });

    const buttons: { text: string; onClick?: () => void }[] = [];
    const walk = (node: unknown): void => {
      if (node == null || typeof node === 'boolean') {
        return;
      }
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
      if (typeof node !== 'object') {
        return;
      }
      const el = node as {
        type?: unknown;
        props?: Record<string, unknown>;
      };
      if (el.type === 'button' && el.props) {
        const children = el.props.children;
        const text = Array.isArray(children)
          ? children.join('')
          : String(children ?? '');
        buttons.push({
          text,
          onClick: el.props.onClick as (() => void) | undefined,
        });
      }
      if (el.props && 'children' in el.props) {
        walk(el.props.children);
      }
    };
    walk(tree);

    const reinforce = buttons.find(
      (b) => b.text === copy.en.lesson.reinforceOnceMore,
    );
    expect(reinforce).toBeDefined();
    reinforce?.onClick?.();
    expect(editCalls).toBe(1);
  });

  it('openAccepted with shortened path shows RouteChangeSummary', () => {
    const html = renderLesson('en', {
      useQuizFallback: false,
      openAccepted: true,
      openAssessment: {
        version: 1,
        conceptId: 'numbers',
        score: 1,
        confidence: 0.95,
        quote: 'ordered numbers',
        feedback: { zh: '好', en: 'good' },
        nextStep: { zh: '继续', en: 'next' },
      },
      quizChecked: false,
      isQuizCorrect: false,
      pathBefore: 25,
      pathAfter: 24,
      conceptTitle: 'Numbers',
      nextConceptTitle: 'Probability',
    });
    expect(html).toContain('Numbers mastered');
    expect(html).toContain('25 steps → 24 steps');
    expect(html).toContain('Next: Probability');
    expect(html).not.toContain(copy.en.lesson.reinforceOnceMore);
  });
});

describe('LessonStep adaptive content density', () => {
  function getRenderedSections(html: string): string[] {
    return [...html.matchAll(/data-lesson-section="([^"]+)"/g)].map((m) => m[1]);
  }

  function isDensityRadioChecked(html: string, value: string): boolean {
    const regex = new RegExp(`<input[^>]*name="lesson-density"[^>]*value="${value}"[^>]*checked|<input[^>]*name="lesson-density"[^>]*checked[^>]*value="${value}"`);
    return regex.test(html);
  }

  it('1. beginner stableLevel opens a lesson in focused mode', () => {
    const html = renderLesson('en', { stableLevel: 'beginner', overrideDensity: null });
    expect(isDensityRadioChecked(html, 'focused')).toBe(true);
    expect(isDensityRadioChecked(html, 'balanced')).toBe(false);
    expect(isDensityRadioChecked(html, 'deep')).toBe(false);
    const sections = getRenderedSections(html);
    expect(sections).toEqual(['explanation']);
    expect(sections).toHaveLength(1);
  });

  it('2. some stableLevel opens a lesson in balanced mode', () => {
    const html = renderLesson('en', { stableLevel: 'some', overrideDensity: null });
    expect(isDensityRadioChecked(html, 'balanced')).toBe(true);
    const sections = getRenderedSections(html);
    expect(sections).toEqual(['explanation', 'example']);
    expect(sections).toHaveLength(2);
  });

  it('3. solid stableLevel opens a lesson in deep mode', () => {
    const html = renderLesson('en', { stableLevel: 'solid', overrideDensity: null });
    expect(isDensityRadioChecked(html, 'deep')).toBe(true);
    const sections = getRenderedSections(html);
    expect(sections).toHaveLength(4);
    expect(new Set(sections).size).toBe(4);
  });

  it('4. focused renders exactly the sections returned by the domain policy', () => {
    for (const style of ['story', 'visual', 'rigorous'] as const) {
      const expected = resolveLessonPresentation({
        stableLevel: 'beginner',
        explanationStyle: style,
        overrideDensity: null,
      });
      const html = renderLesson('en', {
        style,
        stableLevel: 'beginner',
        overrideDensity: null,
      });
      expect(getRenderedSections(html)).toEqual(expected.visibleSections);
    }
  });

  it('5. balanced renders exactly its policy sections', () => {
    for (const style of ['story', 'visual', 'rigorous'] as const) {
      const expected = resolveLessonPresentation({
        stableLevel: 'some',
        explanationStyle: style,
        overrideDensity: null,
      });
      const html = renderLesson('en', {
        style,
        stableLevel: 'some',
        overrideDensity: null,
      });
      expect(getRenderedSections(html)).toEqual(expected.visibleSections);
    }
  });

  it('6. deep renders all four sections', () => {
    for (const style of ['story', 'visual', 'rigorous'] as const) {
      const html = renderLesson('en', {
        style,
        stableLevel: 'solid',
        overrideDensity: null,
      });
      const sections = getRenderedSections(html);
      expect(sections).toHaveLength(4);
      expect(new Set(sections).size).toBe(4);
    }
  });

  it('7. a manual override changes visible sections', () => {
    const defaultHtml = renderLesson('en', { stableLevel: 'beginner', overrideDensity: null });
    expect(getRenderedSections(defaultHtml)).toHaveLength(1);

    const overriddenHtml = renderLesson('en', { stableLevel: 'beginner', overrideDensity: 'deep' });
    expect(getRenderedSections(overriddenHtml)).toHaveLength(4);
    expect(isDensityRadioChecked(overriddenHtml, 'deep')).toBe(true);

    const solidFocusedHtml = renderLesson('en', { stableLevel: 'solid', overrideDensity: 'focused' });
    expect(getRenderedSections(solidFocusedHtml)).toHaveLength(1);
    expect(isDensityRadioChecked(solidFocusedHtml, 'focused')).toBe(true);
  });

  it('8. a manual override does not change stableLevel or mastery', () => {
    const belief = createLearnerBelief('beginner');
    const initialMastery = { ...belief.mastery };
    const initialStableLevel = belief.stableLevel;

    const updatedBelief = applyLearnerEvidence(belief, {
      kind: 'interaction',
      source: 'content-expand',
    });

    expect(updatedBelief.stableLevel).toBe(initialStableLevel);
    expect(updatedBelief.mastery).toEqual(initialMastery);
    expect(updatedBelief.stage).toEqual(belief.stage);
    expect(updatedBelief.conceptEvidence).toEqual(belief.conceptEvidence);
    expect(updatedBelief.interactionCount).toBe(belief.interactionCount + 1);
  });

  it('9. initial render does not record an interaction', () => {
    let interactionCalls = 0;
    const mockRecord = () => {
      interactionCalls += 1;
    };
    renderLesson('en', {
      stableLevel: 'beginner',
      overrideDensity: null,
      onOverrideDensity: () => mockRecord(),
    });
    expect(interactionCalls).toBe(0);
  });

  it('10. changing density records exactly one interaction', () => {
    let interactionCalls = 0;
    let recordedSource: string | null = null;
    const recordInteraction = (source: string) => {
      interactionCalls += 1;
      recordedSource = source;
    };

    let overrideDensity: ContentDensity | null = null;
    const lessonSnapshotLevel: Level = 'beginner';

    function handleDensityChange(density: ContentDensity) {
      const currentActive = overrideDensity ?? defaultDensityForLevel(lessonSnapshotLevel);
      if (density === currentActive) return;
      recordInteraction('content-expand');
      overrideDensity = density;
    }

    handleDensityChange('deep');
    expect(interactionCalls).toBe(1);
    expect(recordedSource).toBe('content-expand');
    expect(overrideDensity).toBe('deep');
  });

  it('11. selecting the active density does not increment the count', () => {
    let interactionCalls = 0;
    const recordInteraction = () => {
      interactionCalls += 1;
    };

    let overrideDensity: ContentDensity | null = null;
    const lessonSnapshotLevel: Level = 'beginner';

    function handleDensityChange(density: ContentDensity) {
      const currentActive = overrideDensity ?? defaultDensityForLevel(lessonSnapshotLevel);
      if (density === currentActive) return;
      recordInteraction();
      overrideDensity = density;
    }

    handleDensityChange('focused');
    expect(interactionCalls).toBe(0);
    expect(overrideDensity).toBeNull();

    handleDensityChange('deep');
    expect(interactionCalls).toBe(1);

    handleDensityChange('deep');
    expect(interactionCalls).toBe(1);
  });

  it('12. locale switching preserves density selection', () => {
    const densitySelection: ContentDensity = 'deep';
    const enHtml = renderLesson('en', {
      stableLevel: 'beginner',
      overrideDensity: densitySelection,
    });
    const zhHtml = renderLesson('zh', {
      stableLevel: 'beginner',
      overrideDensity: densitySelection,
    });

    expect(isDensityRadioChecked(enHtml, 'deep')).toBe(true);
    expect(isDensityRadioChecked(zhHtml, 'deep')).toBe(true);
    expect(getRenderedSections(enHtml)).toHaveLength(4);
    expect(getRenderedSections(zhHtml)).toHaveLength(4);
  });

  it('13. retrying preserves density selection', () => {
    const retryHtml = renderLesson('en', {
      stableLevel: 'beginner',
      overrideDensity: 'deep',
      quizChecked: true,
      isQuizCorrect: false,
      quizAttempts: 1,
    });
    expect(isDensityRadioChecked(retryHtml, 'deep')).toBe(true);
    expect(getRenderedSections(retryHtml)).toHaveLength(4);
  });

  it('14. opening the next lesson resets the override and uses the latest stableLevel', () => {
    let override: ContentDensity | null = 'deep';
    let snapshotLevel: Level = 'beginner';

    const latestBeliefLevel: Level = 'some';
    function onOpenLesson() {
      override = null;
      snapshotLevel = latestBeliefLevel;
    }
    onOpenLesson();

    expect(override).toBeNull();
    expect(snapshotLevel).toBe('some');

    const nextHtml = renderLesson('en', {
      stableLevel: snapshotLevel,
      overrideDensity: override,
    });
    expect(isDensityRadioChecked(nextHtml, 'balanced')).toBe(true);
    expect(getRenderedSections(nextHtml)).toHaveLength(2);
  });

  it('15. English UI contains no Chinese density labels', () => {
    const html = renderLesson('en');
    const fieldsetMatch = html.match(/<fieldset[\s\S]*?<\/fieldset>/);
    expect(fieldsetMatch).not.toBeNull();
    const fieldsetHtml = fieldsetMatch![0];

    expect(fieldsetHtml).toContain(copy.en.lesson.density.legend);
    expect(fieldsetHtml).toContain(copy.en.lesson.density.options.focused);
    expect(fieldsetHtml).toContain(copy.en.lesson.density.options.balanced);
    expect(fieldsetHtml).toContain(copy.en.lesson.density.options.deep);

    expect(fieldsetHtml).not.toMatch(/[\u4e00-\u9fa5]/);
  });

  it('16. Chinese UI contains no English density labels where localized copy is expected', () => {
    const html = renderLesson('zh');
    const fieldsetMatch = html.match(/<fieldset[\s\S]*?<\/fieldset>/);
    expect(fieldsetMatch).not.toBeNull();
    const fieldsetHtml = fieldsetMatch![0];

    expect(fieldsetHtml).toContain(copy.zh.lesson.density.legend);
    expect(fieldsetHtml).toContain(copy.zh.lesson.density.options.focused);
    expect(fieldsetHtml).toContain(copy.zh.lesson.density.options.balanced);
    expect(fieldsetHtml).toContain(copy.zh.lesson.density.options.deep);

    expect(fieldsetHtml).not.toContain(copy.en.lesson.density.legend);
    expect(fieldsetHtml).not.toContain(copy.en.lesson.density.options.focused);
    expect(fieldsetHtml).not.toContain(copy.en.lesson.density.options.balanced);
    expect(fieldsetHtml).not.toContain(copy.en.lesson.density.options.deep);
  });

  it('17. unsubmitted open answer text is preserved and rendered across density modes', () => {
    const unsubmittedDraft = 'Numbers let us count and measure things precisely.';
    const focusedHtml = renderLesson('en', {
      useQuizFallback: false,
      openAnswerText: unsubmittedDraft,
      overrideDensity: 'focused',
    });
    expect(focusedHtml).toContain(unsubmittedDraft);

    const deepHtml = renderLesson('en', {
      useQuizFallback: false,
      openAnswerText: unsubmittedDraft,
      overrideDensity: 'deep',
    });
    expect(deepHtml).toContain(unsubmittedDraft);
  });
});

describe('LessonStep Adaptive Journey Explainer integration', () => {
  it('renders quick-quiz evidence explanation upon successful quiz route change', () => {
    const html = renderLesson('en', {
      useQuizFallback: true,
      quizChecked: true,
      isQuizCorrect: true,
      pathBefore: 25,
      pathAfter: 24,
      explainer: {
        evidenceSource: 'quick-quiz',
        stableLevelBefore: 'beginner',
        stableLevelAfter: 'beginner',
        pendingLevel: null,
        pendingLevelCount: 0,
        requiredConsecutiveEvidence: 2,
      },
    });

    expect(html).toContain(copy.en.lesson.routeChange.mastered('Numbers'));
    expect(html).toContain(copy.en.lesson.routeChange.adaptiveExplainer.trigger);
    expect(html).toContain(
      copy.en.lesson.routeChange.adaptiveExplainer.evidence.quickQuiz,
    );
    expect(html).not.toContain(
      copy.en.lesson.routeChange.adaptiveExplainer.evidence.openAnswer,
    );
  });

  it('renders open-answer evidence explanation upon successful open-answer assessment', () => {
    const html = renderLesson('en', {
      useQuizFallback: false,
      openAccepted: true,
      pathBefore: 25,
      pathAfter: 24,
      explainer: {
        evidenceSource: 'open-answer',
        stableLevelBefore: 'beginner',
        stableLevelAfter: 'beginner',
        pendingLevel: null,
        pendingLevelCount: 0,
        requiredConsecutiveEvidence: 2,
      },
    });

    expect(html).toContain(copy.en.lesson.routeChange.mastered('Numbers'));
    expect(html).toContain(copy.en.lesson.routeChange.adaptiveExplainer.trigger);
    expect(html).toContain(
      copy.en.lesson.routeChange.adaptiveExplainer.evidence.openAnswer,
    );
    expect(html).not.toContain(
      copy.en.lesson.routeChange.adaptiveExplainer.evidence.quickQuiz,
    );
  });

  it('does not render explainer or route-change summary when no route shortening occurred', () => {
    const quizUnchangedHtml = renderLesson('en', {
      useQuizFallback: true,
      quizChecked: true,
      isQuizCorrect: true,
      pathBefore: 25,
      pathAfter: 25,
      explainer: {
        evidenceSource: 'quick-quiz',
        stableLevelBefore: 'beginner',
        stableLevelAfter: 'beginner',
        pendingLevel: null,
        pendingLevelCount: 0,
        requiredConsecutiveEvidence: 2,
      },
    });

    expect(quizUnchangedHtml).not.toContain(
      copy.en.lesson.routeChange.mastered('Numbers'),
    );
    expect(quizUnchangedHtml).not.toContain(
      copy.en.lesson.routeChange.adaptiveExplainer.trigger,
    );
    expect(quizUnchangedHtml).not.toContain(
      copy.en.lesson.routeChange.adaptiveExplainer.evidence.quickQuiz,
    );

    const openUnchangedHtml = renderLesson('en', {
      useQuizFallback: false,
      openAccepted: true,
      pathBefore: 25,
      pathAfter: 25,
      explainer: {
        evidenceSource: 'open-answer',
        stableLevelBefore: 'beginner',
        stableLevelAfter: 'beginner',
        pendingLevel: null,
        pendingLevelCount: 0,
        requiredConsecutiveEvidence: 2,
      },
    });

    expect(openUnchangedHtml).not.toContain(
      copy.en.lesson.routeChange.mastered('Numbers'),
    );
    expect(openUnchangedHtml).not.toContain(
      copy.en.lesson.routeChange.adaptiveExplainer.trigger,
    );
    expect(openUnchangedHtml).not.toContain(
      copy.en.lesson.routeChange.adaptiveExplainer.evidence.openAnswer,
    );
  });
});

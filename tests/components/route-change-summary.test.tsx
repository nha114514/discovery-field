import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RouteChangeSummary } from '../../components/learning/route-change-summary';
import { copy } from '../../lib/i18n/copy';

function findButtons(root: unknown): { text: string; onClick?: () => void }[] {
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
  walk(root);
  return buttons;
}

describe('RouteChangeSummary Component', () => {
  it('renders correctly in English (25 -> 24 steps)', () => {
    const html = renderToStaticMarkup(
      RouteChangeSummary({
        copy: copy.en,
        conceptTitle: 'Numbers',
        nextConceptTitle: 'Probability',
        pathBefore: 25,
        pathAfter: 24,
        explainer: {
          evidenceSource: 'quick-quiz',
          stableLevelBefore: 'beginner',
          stableLevelAfter: 'beginner',
          pendingLevel: null,
          pendingLevelCount: 0, requiredConsecutiveEvidence: 2,
        },
        onContinueNext: () => undefined,
        onViewRoute: () => undefined,
      }),
    );
    expect(html).toContain('Numbers mastered');
    expect(html).toContain('25 steps → 24 steps');
    expect(html).toContain('Next: Probability');
    expect(html).toContain(copy.en.lesson.routeChange.explanation);
    expect(html).not.toContain('已掌握');
  });

  it('renders correctly in Chinese (25 -> 24 steps)', () => {
    const html = renderToStaticMarkup(
      RouteChangeSummary({
        copy: copy.zh,
        conceptTitle: '数字',
        nextConceptTitle: '概率',
        pathBefore: 25,
        pathAfter: 24,
        explainer: {
          evidenceSource: 'quick-quiz',
          stableLevelBefore: 'beginner',
          stableLevelAfter: 'beginner',
          pendingLevel: null,
          pendingLevelCount: 0, requiredConsecutiveEvidence: 2,
        },
        onContinueNext: () => undefined,
        onViewRoute: () => undefined,
      }),
    );
    expect(html).toContain('已掌握「数字」');
    expect(html).toContain('25 步 → 24 步');
    expect(html).toContain('下一课：概率');
    expect(html).toContain(copy.zh.lesson.routeChange.explanation);
    expect(html).not.toContain('mastered');
  });

  it('renders null if pathBefore === pathAfter', () => {
    const html = renderToStaticMarkup(
      RouteChangeSummary({
        copy: copy.en,
        conceptTitle: 'Numbers',
        nextConceptTitle: 'Probability',
        pathBefore: 25,
        pathAfter: 25,
        explainer: {
          evidenceSource: 'quick-quiz',
          stableLevelBefore: 'beginner',
          stableLevelAfter: 'beginner',
          pendingLevel: null,
          pendingLevelCount: 0, requiredConsecutiveEvidence: 2,
        },
        onContinueNext: () => undefined,
        onViewRoute: () => undefined,
      }),
    );
    expect(html).toBe('');
  });

  it('uses singular step when count is 1', () => {
    const html = renderToStaticMarkup(
      RouteChangeSummary({
        copy: copy.en,
        conceptTitle: 'Final Concept',
        nextConceptTitle: null,
        pathBefore: 1,
        pathAfter: 0,
        explainer: {
          evidenceSource: 'quick-quiz',
          stableLevelBefore: 'beginner',
          stableLevelAfter: 'beginner',
          pendingLevel: null,
          pendingLevelCount: 0, requiredConsecutiveEvidence: 2,
        },
        onContinueNext: () => undefined,
        onViewRoute: () => undefined,
      }),
    );
    expect(html).toContain('1 step → 0 steps');
    expect(html).toContain('Goal completed');
    expect(html).not.toContain('Next:');
    expect(html).not.toContain('1 steps');
  });

  it('hides visible numbers from the accessibility tree', () => {
    const html = renderToStaticMarkup(
      RouteChangeSummary({
        copy: copy.en,
        conceptTitle: 'Numbers',
        nextConceptTitle: 'Probability',
        pathBefore: 25,
        pathAfter: 24,
        explainer: {
          evidenceSource: 'quick-quiz',
          stableLevelBefore: 'beginner',
          stableLevelAfter: 'beginner',
          pendingLevel: null,
          pendingLevelCount: 0, requiredConsecutiveEvidence: 2,
        },
        onContinueNext: () => undefined,
        onViewRoute: () => undefined,
      }),
    );
    expect(html).toMatch(/aria-hidden="true"[^>]*>25</);
    expect(html).toMatch(/aria-hidden="true"[^>]*>24</);
    expect(html).toContain('25 steps → 24 steps');
  });

  it('continue button calls only onContinueNext', () => {
    let continueCalls = 0;
    let routeCalls = 0;
    const tree = RouteChangeSummary({
      copy: copy.en,
      conceptTitle: 'Numbers',
      nextConceptTitle: 'Probability',
      pathBefore: 25,
      pathAfter: 24,
        explainer: {
          evidenceSource: 'quick-quiz',
          stableLevelBefore: 'beginner',
          stableLevelAfter: 'beginner',
          pendingLevel: null,
          pendingLevelCount: 0, requiredConsecutiveEvidence: 2,
        },
      onContinueNext: () => {
        continueCalls += 1;
      },
      onViewRoute: () => {
        routeCalls += 1;
      },
    });
    const buttons = findButtons(tree);
    const cont = buttons.find(
      (b) => b.text === copy.en.lesson.continueNext,
    );
    expect(cont).toBeDefined();
    cont?.onClick?.();
    expect(continueCalls).toBe(1);
    expect(routeCalls).toBe(0);
  });

  it('view route button calls only onViewRoute', () => {
    let continueCalls = 0;
    let routeCalls = 0;
    const tree = RouteChangeSummary({
      copy: copy.en,
      conceptTitle: 'Numbers',
      nextConceptTitle: 'Probability',
      pathBefore: 25,
      pathAfter: 24,
        explainer: {
          evidenceSource: 'quick-quiz',
          stableLevelBefore: 'beginner',
          stableLevelAfter: 'beginner',
          pendingLevel: null,
          pendingLevelCount: 0, requiredConsecutiveEvidence: 2,
        },
      onContinueNext: () => {
        continueCalls += 1;
      },
      onViewRoute: () => {
        routeCalls += 1;
      },
    });
    const buttons = findButtons(tree);
    const view = buttons.find(
      (b) => b.text === copy.en.lesson.viewUpdatedRoute,
    );
    expect(view).toBeDefined();
    view?.onClick?.();
    expect(routeCalls).toBe(1);
    expect(continueCalls).toBe(0);
  });

  it('completed route shows only view-route primary and no continue', () => {
    let continueCalls = 0;
    let routeCalls = 0;
    const tree = RouteChangeSummary({
      copy: copy.en,
      conceptTitle: 'Final Concept',
      nextConceptTitle: null,
      pathBefore: 1,
      pathAfter: 0,
        explainer: {
          evidenceSource: 'quick-quiz',
          stableLevelBefore: 'beginner',
          stableLevelAfter: 'beginner',
          pendingLevel: null,
          pendingLevelCount: 0, requiredConsecutiveEvidence: 2,
        },
      onContinueNext: () => {
        continueCalls += 1;
      },
      onViewRoute: () => {
        routeCalls += 1;
      },
    });
    const buttons = findButtons(tree);
    expect(
      buttons.some((b) => b.text === copy.en.lesson.continueNext),
    ).toBe(false);
    const view = buttons.find(
      (b) => b.text === copy.en.lesson.viewUpdatedRoute,
    );
    expect(buttons).toHaveLength(1);
    view?.onClick?.();
    expect(routeCalls).toBe(1);
    expect(continueCalls).toBe(0);
  });

  describe('Adaptive Journey Explainer', () => {
    it('English quick-quiz explanation', () => {
      const html = renderToStaticMarkup(
        RouteChangeSummary({
          copy: copy.en,
          conceptTitle: 'Numbers',
          nextConceptTitle: 'Probability',
          pathBefore: 25,
          pathAfter: 24,
          onContinueNext: () => undefined,
          onViewRoute: () => undefined,
          explainer: {
            evidenceSource: 'quick-quiz',
            stableLevelBefore: 'beginner',
            stableLevelAfter: 'beginner',
            pendingLevel: null,
            pendingLevelCount: 0, requiredConsecutiveEvidence: 2,
          },
        }),
      );
      expect(html).toContain('Why did my path change?');
      expect(html).toContain('This quick-quiz answer counted as knowledge evidence.');
    });

    it('Chinese quick-quiz explanation', () => {
      const html = renderToStaticMarkup(
        RouteChangeSummary({
          copy: copy.zh,
          conceptTitle: '数字',
          nextConceptTitle: '概率',
          pathBefore: 25,
          pathAfter: 24,
          onContinueNext: () => undefined,
          onViewRoute: () => undefined,
          explainer: {
            evidenceSource: 'quick-quiz',
            stableLevelBefore: 'beginner',
            stableLevelAfter: 'beginner',
            pendingLevel: null,
            pendingLevelCount: 0, requiredConsecutiveEvidence: 2,
          },
        }),
      );
      expect(html).toContain('我的路线为什么改变了？');
      expect(html).toContain('这次快捷测验的回答被记为知识证据。');
    });

    it('Open-answer evidence copy', () => {
      const html = renderToStaticMarkup(
        RouteChangeSummary({
          copy: copy.en,
          conceptTitle: 'Numbers',
          nextConceptTitle: 'Probability',
          pathBefore: 25,
          pathAfter: 24,
          onContinueNext: () => undefined,
          onViewRoute: () => undefined,
          explainer: {
            evidenceSource: 'open-answer',
            stableLevelBefore: 'beginner',
            stableLevelAfter: 'beginner',
            pendingLevel: null,
            pendingLevelCount: 0, requiredConsecutiveEvidence: 2,
          },
        }),
      );
      expect(html).toContain('Your accepted explanation counted as knowledge evidence.');
    });

    it('Standard Numbers case (unchanged level)', () => {
      const html = renderToStaticMarkup(
        RouteChangeSummary({
          copy: copy.en,
          conceptTitle: 'Numbers',
          nextConceptTitle: 'Probability',
          pathBefore: 25,
          pathAfter: 24,
          onContinueNext: () => undefined,
          onViewRoute: () => undefined,
          explainer: {
            evidenceSource: 'quick-quiz',
            stableLevelBefore: 'beginner',
            stableLevelAfter: 'beginner',
            pendingLevel: null,
            pendingLevelCount: 0, requiredConsecutiveEvidence: 2,
          },
        }),
      );
      expect(html).toContain('Your overall lesson detail stays ' + copy.en.levels.beginner);
      expect(html).not.toContain('but is waiting for consistent evidence');
      expect(html).not.toContain('your default lesson detail changed from');
    });

    it('Pending shift in English with target level and singular remaining evidence', () => {
      const html = renderToStaticMarkup(
        RouteChangeSummary({
          copy: copy.en,
          conceptTitle: 'Numbers',
          nextConceptTitle: 'Probability',
          pathBefore: 25,
          pathAfter: 24,
          onContinueNext: () => undefined,
          onViewRoute: () => undefined,
          explainer: {
            evidenceSource: 'quick-quiz',
            stableLevelBefore: 'beginner',
            stableLevelAfter: 'beginner',
            pendingLevel: 'some',
            pendingLevelCount: 1,
            requiredConsecutiveEvidence: 2,
          },
        }),
      );
      expect(html).toContain('The current evidence points toward ' + copy.en.levels.some);
      expect(html).toContain(
        'This is 1 of 2 required consecutive pieces of evidence; 1 more is needed before the stable level changes.',
      );
      expect(html).not.toContain('Your overall lesson detail stays');
      expect(html).not.toContain('0.');
      expect(html).not.toContain('pendingLevel');
    });

    it('Pending shift in Chinese with target level and required evidence counts', () => {
      const html = renderToStaticMarkup(
        RouteChangeSummary({
          copy: copy.zh,
          conceptTitle: '数字',
          nextConceptTitle: '概率',
          pathBefore: 25,
          pathAfter: 24,
          onContinueNext: () => undefined,
          onViewRoute: () => undefined,
          explainer: {
            evidenceSource: 'quick-quiz',
            stableLevelBefore: 'beginner',
            stableLevelAfter: 'beginner',
            pendingLevel: 'some',
            pendingLevelCount: 1,
            requiredConsecutiveEvidence: 2,
          },
        }),
      );
      expect(html).toContain('当前证据倾向于「' + copy.zh.levels.some + '」');
      expect(html).toContain('这是连续 2 次证据中的第 1 次；还需要 1 次，稳定阶段才会改变。');
      expect(html).not.toContain('你的整体课程详细程度仍为');
      expect(html).not.toContain('0.');
    });

    it('Pending shift with plural remaining evidence in English', () => {
      const html = renderToStaticMarkup(
        RouteChangeSummary({
          copy: copy.en,
          conceptTitle: 'Numbers',
          nextConceptTitle: 'Probability',
          pathBefore: 25,
          pathAfter: 24,
          onContinueNext: () => undefined,
          onViewRoute: () => undefined,
          explainer: {
            evidenceSource: 'quick-quiz',
            stableLevelBefore: 'beginner',
            stableLevelAfter: 'beginner',
            pendingLevel: 'some',
            pendingLevelCount: 1,
            requiredConsecutiveEvidence: 3,
          },
        }),
      );
      expect(html).toContain('The current evidence points toward ' + copy.en.levels.some);
      expect(html).toContain(
        'This is 1 of 3 required consecutive pieces of evidence; 2 more are needed before the stable level changes.',
      );
    });

    it('Confirmed stable-level change', () => {
      const html = renderToStaticMarkup(
        RouteChangeSummary({
          copy: copy.en,
          conceptTitle: 'Numbers',
          nextConceptTitle: 'Probability',
          pathBefore: 25,
          pathAfter: 24,
          onContinueNext: () => undefined,
          onViewRoute: () => undefined,
          explainer: {
            evidenceSource: 'quick-quiz',
            stableLevelBefore: 'beginner',
            stableLevelAfter: 'some',
            pendingLevel: null,
            pendingLevelCount: 0, requiredConsecutiveEvidence: 2,
          },
        }),
      );
      expect(html).toContain('your default lesson detail changed from ' + copy.en.levels.beginner + ' to ' + copy.en.levels.some);
      expect(html).not.toContain('waiting for consistent evidence');
      expect(html).not.toContain('Your overall lesson detail stays');
    });

    it('Completed route with no next concept', () => {
      const html = renderToStaticMarkup(
        RouteChangeSummary({
          copy: copy.en,
          conceptTitle: 'Numbers',
          nextConceptTitle: null,
          pathBefore: 1,
          pathAfter: 0,
          onContinueNext: () => undefined,
          onViewRoute: () => undefined,
          explainer: {
            evidenceSource: 'quick-quiz',
            stableLevelBefore: 'beginner',
            stableLevelAfter: 'beginner',
            pendingLevel: null,
            pendingLevelCount: 0, requiredConsecutiveEvidence: 2,
          },
        }),
      );
      expect(html).toContain('Your learning route is now complete.');
      expect(html).not.toContain('is now the next recommended concept');
    });

    it('Statement that the concept remains in the full knowledge map', () => {
      const html = renderToStaticMarkup(
        RouteChangeSummary({
          copy: copy.en,
          conceptTitle: 'Numbers',
          nextConceptTitle: 'Probability',
          pathBefore: 25,
          pathAfter: 24,
          onContinueNext: () => undefined,
          onViewRoute: () => undefined,
          explainer: {
            evidenceSource: 'quick-quiz',
            stableLevelBefore: 'beginner',
            stableLevelAfter: 'beginner',
            pendingLevel: null,
            pendingLevelCount: 0, requiredConsecutiveEvidence: 2,
          },
        }),
      );
      expect(html).toContain('Numbers is mastered, so it was removed from your remaining learning route. It still stays visible in the full knowledge map.');
    });

    it('No raw probability values or internal variable names', () => {
      const html = renderToStaticMarkup(
        RouteChangeSummary({
          copy: copy.en,
          conceptTitle: 'Numbers',
          nextConceptTitle: 'Probability',
          pathBefore: 25,
          pathAfter: 24,
          onContinueNext: () => undefined,
          onViewRoute: () => undefined,
          explainer: {
            evidenceSource: 'quick-quiz',
            stableLevelBefore: 'beginner',
            stableLevelAfter: 'beginner',
            pendingLevel: null,
            pendingLevelCount: 0, requiredConsecutiveEvidence: 2,
          },
        }),
      );
      expect(html).not.toContain('0.');
      expect(html).not.toContain('stableLevel');
      expect(html).not.toContain('pendingLevel');
      expect(html).not.toContain('interactionCount');
    });
  });
});

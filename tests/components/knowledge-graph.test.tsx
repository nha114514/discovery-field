import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { KnowledgeGraph } from '../../components/learning/knowledge-graph';
import { buildKnowledgeGraphView } from '../../lib/domain/knowledge-graph-view';
import type { KnowledgeGraphView } from '../../lib/domain/knowledge-graph-view';
import { buildLearningPath } from '../../lib/domain/learning-path';
import { copy } from '../../lib/i18n/copy';
import {
  transformerConcepts,
  transformerEdges,
} from '../../lib/domain/transformer-graph';
import type { MasteryByConcept } from '../../lib/domain/mastery';

// Allow calling the function component without a React hooks dispatcher
// when asserting onSelectNode click wiring.
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useMemo: <T,>(factory: () => T): T => factory(),
    useState: <T,>(
      initial: T | (() => T),
    ): [T, (next: T | ((prev: T) => T)) => void] => {
      const value =
        typeof initial === 'function' ? (initial as () => T)() : initial;
      return [
        value,
        () => {
          /* noop in unit click wiring tests */
        },
      ];
    },
  };
});

function makeView(mastery: MasteryByConcept = {}) {
  const learningPath = buildLearningPath({
    targetId: 'transformer',
    concepts: transformerConcepts,
    edges: transformerEdges,
    mastery,
  });
  return buildKnowledgeGraphView({
    concepts: transformerConcepts,
    edges: transformerEdges,
    mastery,
    learningPath,
  });
}

function render(view = makeView(), locale: 'zh' | 'en' = 'zh') {
  return renderToStaticMarkup(
    createElement(KnowledgeGraph, {
      view,
      locale,
      copy: copy[locale],
    }),
  );
}

describe('KnowledgeGraph', () => {
  it('renders all 25 nodes with unique data-graph-node', () => {
    const html = render();
    const ids = [...html.matchAll(/data-graph-node="([^"]+)"/g)].map(
      (m) => m[1],
    );
    expect(ids).toHaveLength(25);
    expect(new Set(ids).size).toBe(25);
  });

  it('opens the orbital map with Attention at its center and real prerequisites nearby', () => {
    const html = render(makeView(), 'en');
    expect(html).toContain('data-atlas-layout="orbital"');
    expect(html).toMatch(/data-graph-node="attention"[^>]*data-orbit="focus"/);
    for (const id of ['vector', 'dot-product', 'softmax']) {
      expect(html).toMatch(new RegExp(`data-graph-node="${id}"[^>]*data-orbit="prerequisite"`));
    }
    expect(html).toContain('data-edge-id="vector-&gt;attention"');
    expect(html).toContain('data-edge-id="dot-product-&gt;attention"');
    expect(html).toContain('data-edge-id="softmax-&gt;attention"');
  });

  it('marks the current node with aria-current="step"', () => {
    const html = render();
    expect(html).toContain('aria-current="step"');
    const view = makeView();
    const current = view.nodes.find((node) => node.state === 'current');
    expect(current?.id).toBe('numbers');
  });

  it('shows Goal badge on Transformer', () => {
    const html = render();
    expect(html).toContain('data-graph-node="transformer"');
    expect(html).toContain(copy.zh.graph.status.goal);
  });

  it('uses Chinese status labels in zh locale', () => {
    const html = render(makeView({ numbers: 0.9 }), 'zh');
    expect(html).toContain('已有理解证据');
    expect(html).toContain('建议先学');
    expect(html).toContain('在建议路线中');
  });

  it('uses English status and titles in en locale', () => {
    const html = render(makeView({ numbers: 0.9 }), 'en');
    expect(html).toContain('Evidence shown');
    expect(html).toContain('Recommended next');
    expect(html).toContain('On your route');
    expect(html).toContain('Numbers');
    expect(html).toContain('Transformer');
  });

  it('does not leak Chinese labels in English render', () => {
    const html = render(makeView({ numbers: 0.9 }), 'en');
    expect(html).not.toContain('已掌握');
    expect(html).not.toContain('非当前路线');
    expect(html).not.toContain('当前');
  });

  it('offers a lesson action in the selected concept inspector', () => {
    const htmlZh = render(makeView(), 'zh');
    expect(htmlZh).toContain(copy.zh.graph.exploreLesson);
    const htmlEn = render(makeView(), 'en');
    expect(htmlEn).toContain(copy.en.graph.exploreLesson);
  });

  it('marks only real edges touching the selected concept as focused', () => {
    const html = render(makeView(), 'en');
    const focused = [...html.matchAll(/data-edge-focus="true"[^>]*data-edge-id="([^"]+)"/g)]
      .map((match) => match[1].replace('&gt;', '>'));
    const expected = transformerEdges
      .filter((edge) => edge.prerequisiteId === 'attention' || edge.conceptId === 'attention')
      .map((edge) => `${edge.prerequisiteId}->${edge.conceptId}`);
    expect(focused.sort()).toEqual(expected.sort());
  });

  it('renders every edge as an SVG path with data-edge-state', () => {
    const view = makeView({ numbers: 0.9 });
    const html = render(view);
    const edgeStates = [
      ...html.matchAll(/data-edge-state="([^"]+)"/g),
    ].map((m) => m[1]);
    expect(edgeStates).toHaveLength(transformerEdges.length);
    expect(edgeStates).toContain('satisfied');
    expect(edgeStates).toContain('active');
  });

  it('does not mutate view input', () => {
    const view = makeView();
    const snapshot = JSON.parse(JSON.stringify(view));
    render(view);
    expect(view).toEqual(snapshot);
  });

  it('does not expose svg as role="img"', () => {
    const html = render();
    expect(html).not.toContain('role="img"');
  });

  it('does not set inline background on node buttons', () => {
    const html = render();
    expect(html).not.toMatch(/style="[^"]*background:/);
  });

  it('preserves distinct state hooks without dark card backgrounds', () => {
    const fixture = makeStateFixture();
    const html = render(fixture, 'zh');
    expect(html).toContain('data-state="mastered"');
    expect(html).toContain('data-state="current"');
    expect(html).toContain('data-state="upcoming"');
    expect(html).toContain('data-state="not-required"');
    expect(html).not.toContain('dark:bg-');
  });

  it('renders all three edge states including inactive', () => {
    const html = render(makeStateFixture(), 'zh');
    const edgeStates = [
      ...html.matchAll(/data-edge-state="([^"]+)"/g),
    ].map((m) => m[1]);
    expect(edgeStates).toContain('satisfied');
    expect(edgeStates).toContain('active');
    expect(edgeStates).toContain('inactive');
  });

  it('does not call onSelectNode on initial render', () => {
    let calls = 0;
    KnowledgeGraph({
      view: makeView(),
      locale: 'zh',
      copy: copy.zh,
      onSelectNode: () => {
        calls += 1;
      },
    });
    expect(calls).toBe(0);
  });

  it('calls onSelectNode exactly once with the clicked conceptId', () => {
    const calls: string[] = [];
    const tree = KnowledgeGraph({
      view: makeView(),
      locale: 'en',
      copy: copy.en,
      onSelectNode: (conceptId) => {
        calls.push(conceptId);
      },
    });

    type El = {
      type?: unknown;
      props?: Record<string, unknown>;
    };

    const buttons: { onClick?: () => void; graphNode?: string }[] = [];
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
      const el = node as El;
      const props = el.props;
      if (el.type === 'foreignObject' && props && typeof props['data-graph-node'] === 'string') {
        const graphNode = props['data-graph-node'] as string;
        const child = props.children as El | undefined;
        const buttonProps = child?.props;
        if (child && child.type === 'button' && buttonProps) {
          buttons.push({
            onClick: buttonProps.onClick as (() => void) | undefined,
            graphNode,
          });
        }
      }
      if (props && 'children' in props) {
        walk(props.children);
      }
    };
    walk(tree);

    const vectorButton = buttons.find((b) => b.graphNode === 'vector');
    expect(vectorButton).toBeDefined();
    expect(calls).toHaveLength(0);
    vectorButton?.onClick?.();
    expect(calls).toHaveLength(1);
    expect(calls[0]).toBe('vector');
  });
});

function makeStateFixture(): KnowledgeGraphView {
  return {
    nodes: [
      {
        id: 'a',
        slug: 'a',
        title: 'A',
        difficulty: 1,
        summary: 'a',
        score: 0.9,
        state: 'mastered',
        layer: 0,
        pathIndex: null,
      },
      {
        id: 'b',
        slug: 'b',
        title: 'B',
        difficulty: 1,
        summary: 'b',
        score: 0,
        state: 'current',
        layer: 1,
        pathIndex: 0,
      },
      {
        id: 'c',
        slug: 'c',
        title: 'C',
        difficulty: 1,
        summary: 'c',
        score: 0,
        state: 'upcoming',
        layer: 2,
        pathIndex: 1,
      },
      {
        id: 'd',
        slug: 'd',
        title: 'D',
        difficulty: 1,
        summary: 'd',
        score: 0,
        state: 'not-required',
        layer: 0,
        pathIndex: null,
      },
    ],
    edges: [
      {
        id: 'a->b',
        prerequisiteId: 'a',
        conceptId: 'b',
        state: 'satisfied',
      },
      {
        id: 'b->c',
        prerequisiteId: 'b',
        conceptId: 'c',
        state: 'active',
      },
      {
        id: 'd->c',
        prerequisiteId: 'd',
        conceptId: 'c',
        state: 'inactive',
      },
    ],
    layers: [['a', 'd'], ['b'], ['c']],
  };
}

import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { RouteStep } from '../../components/learning/route-step';
import { buildKnowledgeGraphView } from '../../lib/domain/knowledge-graph-view';
import { buildLearningPath } from '../../lib/domain/learning-path';
import {
  transformerConcepts,
  transformerEdges,
} from '../../lib/domain/transformer-graph';
import { copy } from '../../lib/i18n/copy';
import { getConceptTitle } from '../../lib/domain/knowledge';
import type { MasteryByConcept } from '../../lib/domain/mastery';

function makeFixture(locale: 'en' | 'zh' = 'en', mastery: MasteryByConcept = {}) {
  const pathIds = buildLearningPath({
    targetId: 'transformer',
    concepts: transformerConcepts,
    edges: transformerEdges,
    mastery,
  });
  const view = buildKnowledgeGraphView({
    concepts: transformerConcepts,
    edges: transformerEdges,
    mastery,
    learningPath: pathIds,
  });
  const pathTitles = pathIds.map((id) => {
    const concept = transformerConcepts.find((c) => c.id === id);
    return concept ? getConceptTitle(concept, locale) : id;
  });
  return {
    goal: 'Transformer',
    levelLabel: locale === 'en' ? 'First time seeing this' : '第一次接触',
    styleLabel: locale === 'en' ? 'Story & analogy' : '故事类比',
    masteredTitles: [],
    pathTitles,
    pathIds,
    view,
    locale,
    copy: copy[locale],
    onStartLesson: () => undefined,
    onSelectNode: () => undefined,
    onToggleUpcoming: () => undefined,
    onRestart: () => undefined,
  };
}

describe('RouteStep Component', () => {
  it('presents the selected reference composition as hero, orbital map, and inspector', () => {
    const html = renderToStaticMarkup(createElement(RouteStep, makeFixture('en')));
    expect(html).toContain('route-atlas-hero');
    expect(html).toContain('aria-label="Understand Transformers from where you are."');
    expect(html).toContain('data-atlas-layout="orbital"');
    expect(html).toContain('knowledge-atlas-inspector');
  });
  it('25-step English route renders all 25 direct <ol> > <li> elements', () => {
    const props = makeFixture('en');
    expect(props.pathIds).toHaveLength(25);

    const html = renderToStaticMarkup(createElement(RouteStep, props));
    const olMatch = html.match(/<ol[^>]*id="learning-path-list"[^>]*>([\s\S]*?)<\/ol>/);
    expect(olMatch).not.toBeNull();
    const olContent = olMatch![1];

    const liMatches = [...olContent.matchAll(/<li\b([^>]*)>/g)];
    expect(liMatches).toHaveLength(25);
  });

  it('only the active first item is initially visible, the other 24 items have hidden', () => {
    const props = makeFixture('en');
    const html = renderToStaticMarkup(createElement(RouteStep, props));
    const olMatch = html.match(/<ol[^>]*id="learning-path-list"[^>]*>([\s\S]*?)<\/ol>/);
    const olContent = olMatch![1];
    const liMatches = [...olContent.matchAll(/<li\b([^>]*)>/g)];

    // Item 0 is visible (does not have hidden attribute)
    expect(liMatches[0][1]).not.toContain('hidden');

    // Items 1..24 have hidden attribute
    for (let i = 1; i < 25; i++) {
      expect(liMatches[i][1]).toContain('hidden');
    }
  });

  it('active item contains Numbers, "Up next", "Start here", and exactly one primary CTA', () => {
    const props = makeFixture('en');
    const html = renderToStaticMarkup(createElement(RouteStep, props));

    const olMatch = html.match(/<ol[^>]*id="learning-path-list"[^>]*>([\s\S]*?)<\/ol>/);
    const olContent = olMatch![1];
    const firstLi = olContent.slice(0, olContent.indexOf('</li>') + 5);

    expect(firstLi).toContain('Numbers');
    expect(firstLi).toContain(copy.en.route.upNext);
    expect(firstLi).toContain(copy.en.route.startHere);
    expect(firstLi).toContain(copy.en.graph.startLesson);

    // Exactly one recommended primary CTA; other lessons use a separate action.
    const buttonMatches = [...html.matchAll(new RegExp(copy.en.graph.startLesson, 'g'))];
    expect(buttonMatches).toHaveLength(1);
  });

  it('offers exploration actions for every upcoming path item, without locked copy', () => {
    const props = makeFixture('en');
    const html = renderToStaticMarkup(createElement(RouteStep, props));
    expect(html).not.toContain('Locked for now');
    expect(html.match(/data-explore-lesson=/g)).toHaveLength(24);
    expect(html).toContain(copy.en.graph.exploreLesson);
  });

  it('collapsed preview says Probability is next and Transformer is final', () => {
    const props = makeFixture('en');
    const html = renderToStaticMarkup(createElement(RouteStep, props));

    expect(html).toContain('Upcoming steps (24)');
    expect(html).toContain('Next: Probability · Final goal: Transformer');
    expect(html).toContain('Show all steps');
  });

  it('Chinese copy is correct for active hero, preview, and toggle', () => {
    const props = makeFixture('zh');
    const html = renderToStaticMarkup(createElement(RouteStep, props));

    expect(html).toContain('当前待学');
    expect(html).toContain('从这里开始');
    expect(html).toContain('数字');
    expect(html).toContain('后续路线（24 个步骤）');
    expect(html).toContain('下一站：概率 · 最终目标：Transformer');
    expect(html).toContain('展开全部步骤');
    expect(html).toContain('开始这一课');

    // Exactly one start button in Chinese render
    const buttonMatches = [...html.matchAll(new RegExp(copy.zh.graph.startLesson, 'g'))];
    expect(buttonMatches).toHaveLength(1);
  });

  it('one-step remaining route has no upcoming toggle', () => {
    const base = makeFixture('en');
    const singleProps = {
      ...base,
      pathIds: ['transformer'],
      pathTitles: ['Transformer'],
    };

    const html = renderToStaticMarkup(createElement(RouteStep, singleProps));
    expect(html).toContain('Transformer');
    expect(html).toContain(copy.en.route.upNext);
    expect(html).toContain(copy.en.graph.startLesson);

    // No toggle or roadmap preview
    expect(html).not.toContain('Upcoming steps');
    expect(html).not.toContain('Show all steps');
    expect(html).not.toContain('aria-controls="learning-path-list"');
  });

  it('completed route has no active CTA or upcoming toggle', () => {
    const base = makeFixture('en');
    const completedProps = {
      ...base,
      pathIds: [],
      pathTitles: [],
    };

    const html = renderToStaticMarkup(createElement(RouteStep, completedProps));
    expect(html).toContain(copy.en.route.completed);
    expect(html).toContain(copy.en.route.noSteps);

    expect(html).not.toContain(copy.en.graph.startLesson);
    expect(html).not.toContain('Upcoming steps');
    expect(html).not.toContain('Show all steps');
    expect(html).not.toContain('learning-path-list');
  });

  it('has no duplicate route IDs or input mutation', () => {
    const props = makeFixture('en');
    const pathIdsCopy = [...props.pathIds];
    const pathTitlesCopy = [...props.pathTitles];

    renderToStaticMarkup(createElement(RouteStep, props));

    expect(props.pathIds).toEqual(pathIdsCopy);
    expect(props.pathTitles).toEqual(pathTitlesCopy);

    // Check unique IDs in path
    expect(new Set(props.pathIds).size).toBe(props.pathIds.length);
  });
});

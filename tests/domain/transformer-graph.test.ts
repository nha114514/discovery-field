import { describe, expect, it } from 'vitest';
import {
  getConceptTitle,
  validateKnowledgeGraph,
  type Concept,
} from '../../lib/domain/knowledge';
import { buildLearningPath } from '../../lib/domain/learning-path';
import {
  transformerConcepts,
  transformerEdges,
  transformerGraph,
} from '../../lib/domain/transformer-graph';

describe('transformer seed graph', () => {
  it('contains 15-25 concepts', () => {
    expect(transformerConcepts.length).toBeGreaterThanOrEqual(15);
    expect(transformerConcepts.length).toBeLessThanOrEqual(25);
  });

  it('includes required core concepts', () => {
    const slugs = new Set(transformerConcepts.map((c) => c.slug));
    for (const slug of [
      'numbers',
      'variables',
      'algebra',
      'function',
      'vector',
      'matrix',
      'dot-product',
      'probability',
      'derivative',
      'loss-function',
      'neural-network',
      'gradient-descent',
      'tokenization',
      'embedding',
      'sequence',
      'softmax',
      'attention',
      'self-attention',
      'positional-encoding',
      'transformer',
    ]) {
      expect(slugs.has(slug), `missing slug ${slug}`).toBe(true);
    }
  });

  it('passes validateKnowledgeGraph', () => {
    expect(() =>
      validateKnowledgeGraph(transformerConcepts, transformerEdges),
    ).not.toThrow();
  });

  it('exposes a single graph object', () => {
    expect(transformerGraph.concepts).toBe(transformerConcepts);
    expect(transformerGraph.edges).toBe(transformerEdges);
  });

  it('yields a non-empty path for Transformer with empty mastery', () => {
    const path = buildLearningPath({
      targetId: transformerConcepts.find((c) => c.slug === 'transformer')!.id,
      concepts: transformerConcepts,
      edges: transformerEdges,
      mastery: {},
    });
    expect(path.length).toBe(transformerConcepts.length);
    expect(path[path.length - 1]).toBe(
      transformerConcepts.find((c) => c.slug === 'transformer')!.id,
    );
    expect(path[0]).toBe('numbers');
  });

  it('skips mastered prerequisites and produces a shorter path', () => {
    const target = transformerConcepts.find((c) => c.slug === 'transformer')!;
    const full = buildLearningPath({
      targetId: target.id,
      concepts: transformerConcepts,
      edges: transformerEdges,
      mastery: {},
    });
    const first = transformerConcepts.find((c) => c.slug === 'numbers')!;
    const partial = buildLearningPath({
      targetId: target.id,
      concepts: transformerConcepts,
      edges: transformerEdges,
      mastery: { [first.id]: 0.95 },
    });
    expect(partial.length).toBeLessThan(full.length);
    expect(partial).not.toContain(first.id);
  });

  it('starts zero-basics users from foundation nodes', () => {
    const path = buildLearningPath({
      targetId: 'transformer',
      concepts: transformerConcepts,
      edges: transformerEdges,
      mastery: {},
    });
    expect(path[0]).toBe('numbers');
    expect(path.indexOf('variables')).toBeLessThan(path.indexOf('function'));
    expect(path.indexOf('algebra')).toBeLessThan(path.indexOf('function'));
    expect(path.indexOf('numbers')).toBeLessThan(path.indexOf('vector'));
  });

  it('has exactly 25 concepts with non-empty titleEn', () => {
    expect(transformerConcepts).toHaveLength(25);
    for (const concept of transformerConcepts) {
      expect(concept.titleEn, concept.slug).toBeTruthy();
      expect(concept.titleEn!.trim().length).toBeGreaterThan(0);
    }
  });

  it('getConceptTitle returns zh and en titles', () => {
    const numbers = transformerConcepts.find((c) => c.slug === 'numbers')!;
    expect(getConceptTitle(numbers, 'zh')).toBe(numbers.title);
    expect(getConceptTitle(numbers, 'en')).toBe('Numbers');
    const transformer = transformerConcepts.find(
      (c) => c.slug === 'transformer',
    )!;
    expect(getConceptTitle(transformer, 'en')).toBe('Transformer');
  });

  it('getConceptTitle falls back to title without titleEn', () => {
    const plain: Concept = {
      id: 'plain',
      slug: 'plain',
      title: '普通节点',
      domain: 'test',
      difficulty: 1,
      summary: 'x',
    };
    expect(getConceptTitle(plain, 'zh')).toBe('普通节点');
    expect(getConceptTitle(plain, 'en')).toBe('普通节点');
  });
});

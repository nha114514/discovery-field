import { describe, expect, it } from 'vitest';
import type {
  Concept,
  PrerequisiteEdge,
} from '../../lib/domain/knowledge';
import { buildLearningPath } from '../../lib/domain/learning-path';
import { MASTERY_THRESHOLD } from '../../lib/domain/mastery';
import type { MasteryByConcept } from '../../lib/domain/mastery';
import {
  transformerConcepts,
  transformerEdges,
} from '../../lib/domain/transformer-graph';
import { buildKnowledgeGraphView } from '../../lib/domain/knowledge-graph-view';

function concept(id: string, slug = id): Concept {
  return {
    id,
    slug,
    title: id,
    domain: 'test',
    difficulty: 1,
    summary: id,
  };
}

function edge(prerequisiteId: string, conceptId: string): PrerequisiteEdge {
  return { prerequisiteId, conceptId, importance: 1 };
}

function emptyMastery(): MasteryByConcept {
  return {};
}

function pathFor(mastery: MasteryByConcept): string[] {
  return buildLearningPath({
    targetId: 'transformer',
    concepts: transformerConcepts,
    edges: transformerEdges,
    mastery,
  });
}

describe('buildKnowledgeGraphView', () => {
  it('includes all 25 transformer nodes and all edges', () => {
    const path = pathFor(emptyMastery());
    const view = buildKnowledgeGraphView({
      concepts: transformerConcepts,
      edges: transformerEdges,
      mastery: emptyMastery(),
      learningPath: path,
    });
    expect(view.nodes).toHaveLength(25);
    expect(view.edges).toHaveLength(transformerEdges.length);
    const ids = view.nodes.map((node) => node.id);
    expect(new Set(ids).size).toBe(25);
  });

  it('gives every edge a unique id and keeps endpoints', () => {
    const path = pathFor(emptyMastery());
    const view = buildKnowledgeGraphView({
      concepts: transformerConcepts,
      edges: transformerEdges,
      mastery: emptyMastery(),
      learningPath: path,
    });
    const edgeIds = view.edges.map((item) => item.id);
    expect(new Set(edgeIds).size).toBe(transformerEdges.length);
    for (const item of view.edges) {
      expect(item.id).toBe(`${item.prerequisiteId}->${item.conceptId}`);
    }
  });

  it('places prerequisite layers strictly before dependent layers', () => {
    const path = pathFor(emptyMastery());
    const view = buildKnowledgeGraphView({
      concepts: transformerConcepts,
      edges: transformerEdges,
      mastery: emptyMastery(),
      learningPath: path,
    });
    const layerById = new Map(view.nodes.map((node) => [node.id, node.layer]));
    for (const item of view.edges) {
      const from = layerById.get(item.prerequisiteId);
      const to = layerById.get(item.conceptId);
      expect(from).toBeDefined();
      expect(to).toBeDefined();
      expect(from!).toBeLessThan(to!);
    }
  });

  it('marks empty-mastery path as current then upcoming', () => {
    const path = pathFor(emptyMastery());
    const view = buildKnowledgeGraphView({
      concepts: transformerConcepts,
      edges: transformerEdges,
      mastery: emptyMastery(),
      learningPath: path,
    });
    const byId = new Map(view.nodes.map((node) => [node.id, node]));
    expect(byId.get(path[0]!)?.state).toBe('current');
    expect(byId.get(path[0]!)?.pathIndex).toBe(0);
    for (let i = 1; i < path.length; i += 1) {
      expect(byId.get(path[i]!)?.state).toBe('upcoming');
      expect(byId.get(path[i]!)?.pathIndex).toBe(i);
    }
  });

  it('recomputes states after mastering the first path node', () => {
    const full = pathFor(emptyMastery());
    const first = full[0]!;
    const mastery: MasteryByConcept = { [first]: 0.9 };
    const path = pathFor(mastery);
    const view = buildKnowledgeGraphView({
      concepts: transformerConcepts,
      edges: transformerEdges,
      mastery,
      learningPath: path,
    });
    const byId = new Map(view.nodes.map((node) => [node.id, node]));
    expect(byId.get(first)?.state).toBe('mastered');
    expect(byId.get(first)?.pathIndex).toBeNull();
    expect(byId.get(first)?.score).toBe(0.9);
    expect(byId.get(path[0]!)?.state).toBe('current');
    expect(path).not.toContain(first);
  });

  it('marks pruned prerequisites as not-required when a dependent is mastered', () => {
    const concepts = [concept('a'), concept('b'), concept('c')];
    const edges = [edge('a', 'b'), edge('b', 'c')];
    const mastery: MasteryByConcept = { b: 0.9 };
    const path = buildLearningPath({
      targetId: 'c',
      concepts,
      edges,
      mastery,
    });
    expect(path).toEqual(['c']);
    const view = buildKnowledgeGraphView({
      concepts,
      edges,
      mastery,
      learningPath: path,
    });
    const byId = new Map(view.nodes.map((node) => [node.id, node]));
    expect(byId.get('b')?.state).toBe('mastered');
    expect(byId.get('a')?.state).toBe('not-required');
    expect(byId.get('c')?.state).toBe('current');
  });

  it('has no current or upcoming when the target is mastered and path is empty', () => {
    const mastery: MasteryByConcept = { transformer: 0.95 };
    const path = pathFor(mastery);
    expect(path).toEqual([]);
    const view = buildKnowledgeGraphView({
      concepts: transformerConcepts,
      edges: transformerEdges,
      mastery,
      learningPath: path,
    });
    expect(view.nodes.some((node) => node.state === 'current')).toBe(false);
    expect(view.nodes.some((node) => node.state === 'upcoming')).toBe(false);
    expect(
      view.nodes.filter((node) => node.state === 'mastered'),
    ).toHaveLength(1);
  });

  it('produces a stable node order across calls', () => {
    const path = pathFor(emptyMastery());
    const input = {
      concepts: transformerConcepts,
      edges: transformerEdges,
      mastery: emptyMastery(),
      learningPath: path,
    };
    const a = buildKnowledgeGraphView(input);
    const b = buildKnowledgeGraphView(input);
    expect(a.nodes.map((node) => `${node.layer}:${node.id}`)).toEqual(
      b.nodes.map((node) => `${node.layer}:${node.id}`),
    );
  });

  it('orders nodes by layer then pathIndex then slug', () => {
    const concepts = [
      concept('t'),
      concept('b'),
      concept('a'),
      concept('root'),
    ];
    const edges = [edge('root', 'a'), edge('root', 'b'), edge('a', 't'), edge('b', 't')];
    const path = ['root', 'b', 'a', 't'];
    const view = buildKnowledgeGraphView({
      concepts,
      edges,
      mastery: emptyMastery(),
      learningPath: path,
    });
    const ids = view.nodes.map((node) => node.id);
    expect(ids[0]).toBe('root');
    // layer 1: pathIndex b=1 before a=2
    expect(ids.indexOf('b')).toBeLessThan(ids.indexOf('a'));
    expect(ids[ids.length - 1]).toBe('t');
    expect(view.nodes.map((node) => node.layer)).toEqual(
      [...view.nodes.map((node) => node.layer)].sort((x, y) => x - y),
    );
  });

  it('keeps titleEn when present', () => {
    const withEn: Concept = {
      ...concept('x'),
      titleEn: 'X Node',
    };
    const view = buildKnowledgeGraphView({
      concepts: [withEn],
      edges: [],
      mastery: emptyMastery(),
      learningPath: ['x'],
    });
    expect(view.nodes[0]?.titleEn).toBe('X Node');
  });

  it('defaults score to 0 when mastery is missing', () => {
    const view = buildKnowledgeGraphView({
      concepts: [concept('a')],
      edges: [],
      mastery: emptyMastery(),
      learningPath: ['a'],
    });
    expect(view.nodes[0]?.score).toBe(0);
  });

  it('uses MASTERY_THRESHOLD as default threshold', () => {
    expect(MASTERY_THRESHOLD).toBe(0.7);
    const view = buildKnowledgeGraphView({
      concepts: [concept('a'), concept('b')],
      edges: [edge('a', 'b')],
      mastery: { a: MASTERY_THRESHOLD },
      learningPath: ['b'],
    });
    expect(view.nodes.find((node) => node.id === 'a')?.state).toBe('mastered');
  });

  it('marks edges by master state', () => {
    const mastery: MasteryByConcept = { numbers: 0.9 };
    const path = pathFor(mastery);
    const view = buildKnowledgeGraphView({
      concepts: transformerConcepts,
      edges: transformerEdges,
      mastery,
      learningPath: path,
    });
    const byId = new Map(view.edges.map((item) => [item.id, item]));
    expect(byId.get('numbers->vector')?.state).toBe('satisfied');
    expect(byId.get('attention->self-attention')?.state).toBe('active');
    // edge from a not-required node into a path node stays inactive if prerequisite not mastered
    expect(byId.get('vector->matrix')?.state).toBe('active');
  });

  it('throws for invalid threshold', () => {
    const base = {
      concepts: [concept('a')],
      edges: [],
      mastery: emptyMastery(),
      learningPath: ['a'],
    };
    expect(() => buildKnowledgeGraphView({ ...base, threshold: -0.1 })).toThrow(
      RangeError,
    );
    expect(() => buildKnowledgeGraphView({ ...base, threshold: 1.1 })).toThrow(
      RangeError,
    );
    expect(() =>
      buildKnowledgeGraphView({ ...base, threshold: Number.NaN }),
    ).toThrow(RangeError);
  });

  it('throws for unknown learningPath id', () => {
    expect(() =>
      buildKnowledgeGraphView({
        concepts: [concept('a')],
        edges: [],
        mastery: emptyMastery(),
        learningPath: ['missing'],
      }),
    ).toThrow(/unknown/i);
  });

  it('throws for duplicate learningPath id', () => {
    expect(() =>
      buildKnowledgeGraphView({
        concepts: [concept('a')],
        edges: [],
        mastery: emptyMastery(),
        learningPath: ['a', 'a'],
      }),
    ).toThrow(/duplicate/i);
  });

  it('throws for invalid mastery values on known concepts', () => {
    expect(() =>
      buildKnowledgeGraphView({
        concepts: [concept('a')],
        edges: [],
        mastery: { a: 1.2 },
        learningPath: ['a'],
      }),
    ).toThrow(RangeError);
  });

  it('does not mutate inputs', () => {
    const concepts = [concept('a'), concept('b')];
    const edges = [edge('a', 'b')];
    const mastery = { b: 0.8 };
    const path = ['b'];
    const conceptsSnapshot = JSON.parse(JSON.stringify(concepts));
    const edgesSnapshot = JSON.parse(JSON.stringify(edges));
    const masterySnapshot = { ...mastery };
    const pathSnapshot = [...path];
    buildKnowledgeGraphView({ concepts, edges, mastery, learningPath: path });
    expect(concepts).toEqual(conceptsSnapshot);
    expect(edges).toEqual(edgesSnapshot);
    expect(mastery).toEqual(masterySnapshot);
    expect(path).toEqual(pathSnapshot);
  });

  it('builds layers covering every node exactly once across layers', () => {
    const path = pathFor(emptyMastery());
    const view = buildKnowledgeGraphView({
      concepts: transformerConcepts,
      edges: transformerEdges,
      mastery: emptyMastery(),
      learningPath: path,
    });
    const layered = view.layers.flat();
    expect(new Set(layered).size).toBe(25);
    expect(layered).toHaveLength(25);
    expect(view.nodes[0]?.layer).toBe(0);
    expect(view.layers[0]?.length).toBeGreaterThan(0);
  });
});

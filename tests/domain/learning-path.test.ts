import { describe, expect, it } from 'vitest';
import type { Concept, PrerequisiteEdge } from '../../lib/domain/knowledge';
import { validateKnowledgeGraph } from '../../lib/domain/knowledge';
import { buildLearningPath } from '../../lib/domain/learning-path';
import type { MasteryByConcept } from '../../lib/domain/mastery';

function concept(
  id: string,
  slug = id,
  overrides: Partial<Concept> = {},
): Concept {
  return {
    id,
    slug,
    title: id,
    domain: 'test',
    difficulty: 1,
    summary: id,
    ...overrides,
  };
}

function edge(
  prerequisiteId: string,
  conceptId: string,
  importance = 1,
): PrerequisiteEdge {
  return { prerequisiteId, conceptId, importance };
}

describe('validateKnowledgeGraph', () => {
  it('accepts a valid graph', () => {
    const concepts = [concept('a'), concept('b')];
    const edges: PrerequisiteEdge[] = [
      { prerequisiteId: 'a', conceptId: 'b', importance: 1 },
    ];
    expect(() => validateKnowledgeGraph(concepts, edges)).not.toThrow();
  });

  it('rejects duplicate ids', () => {
    const concepts = [concept('a'), concept('a', 'b')];
    expect(() => validateKnowledgeGraph(concepts, [])).toThrow(/duplicate id/i);
  });

  it('rejects duplicate slugs', () => {
    const concepts = [concept('a'), concept('b', 'a')];
    expect(() => validateKnowledgeGraph(concepts, [])).toThrow(
      /duplicate slug/i,
    );
  });

  it('rejects edges with missing endpoints', () => {
    const concepts = [concept('a')];
    const edges: PrerequisiteEdge[] = [
      { prerequisiteId: 'a', conceptId: 'missing', importance: 1 },
    ];
    expect(() => validateKnowledgeGraph(concepts, edges)).toThrow(
      /endpoint|不存在/i,
    );
  });

  it('rejects self-loops', () => {
    const concepts = [concept('a')];
    const edges: PrerequisiteEdge[] = [
      { prerequisiteId: 'a', conceptId: 'a', importance: 1 },
    ];
    expect(() => validateKnowledgeGraph(concepts, edges)).toThrow(
      /self-loop|自环/i,
    );
  });

  it('rejects cyclic dependencies', () => {
    const concepts = [concept('a'), concept('b')];
    const edges: PrerequisiteEdge[] = [
      { prerequisiteId: 'a', conceptId: 'b', importance: 1 },
      { prerequisiteId: 'b', conceptId: 'a', importance: 1 },
    ];
    expect(() => validateKnowledgeGraph(concepts, edges)).toThrow(
      /cyclic|cycle|循环/i,
    );
  });

  it('rejects non-positive importance', () => {
    const concepts = [concept('a'), concept('b')];
    const edges: PrerequisiteEdge[] = [
      { prerequisiteId: 'a', conceptId: 'b', importance: 0 },
    ];
    expect(() => validateKnowledgeGraph(concepts, edges)).toThrow(
      /importance/i,
    );
  });

  it('rejects fractional importance', () => {
    const concepts = [concept('a'), concept('b')];
    const edges: PrerequisiteEdge[] = [
      { prerequisiteId: 'a', conceptId: 'b', importance: 1.5 },
    ];
    expect(() => validateKnowledgeGraph(concepts, edges)).toThrow(
      /importance/i,
    );
  });

  it('rejects duplicate same-direction edges', () => {
    const concepts = [concept('a'), concept('b')];
    const edges: PrerequisiteEdge[] = [
      { prerequisiteId: 'a', conceptId: 'b', importance: 1 },
      { prerequisiteId: 'a', conceptId: 'b', importance: 2 },
    ];
    expect(() => validateKnowledgeGraph(concepts, edges)).toThrow(
      /duplicate edge/i,
    );
  });
});

describe('buildLearningPath', () => {
  it('returns empty when target is mastered', () => {
    const concepts = [concept('t')];
    const mastery: MasteryByConcept = { t: 0.9 };
    expect(
      buildLearningPath({ targetId: 't', concepts, edges: [], mastery }),
    ).toEqual([]);
  });

  it('returns target only when it has no prerequisites', () => {
    const concepts = [concept('t')];
    const path = buildLearningPath({
      targetId: 't',
      concepts,
      edges: [],
      mastery: {},
    });
    expect(path).toEqual(['t']);
  });

  it('orders a linear dependency chain', () => {
    const concepts = [concept('a'), concept('b'), concept('c')];
    const edges = [edge('a', 'b'), edge('b', 'c')];
    const path = buildLearningPath({
      targetId: 'c',
      concepts,
      edges,
      mastery: {},
    });
    expect(path).toEqual(['a', 'b', 'c']);
  });

  it('skips mastered node and its prerequisites', () => {
    // a -> b -> c, b mastered => only learn c (stop at b)
    const concepts = [concept('a'), concept('b'), concept('c')];
    const edges = [edge('a', 'b'), edge('b', 'c')];
    const mastery: MasteryByConcept = { b: 0.8 };
    const path = buildLearningPath({
      targetId: 'c',
      concepts,
      edges,
      mastery,
    });
    expect(path).toEqual(['c']);
  });

  it('handles multi-branch dependencies with stable order', () => {
    // roots: a, b both required by t; a importance 2, b importance 1
    const concepts = [
      concept('t'),
      concept('a'),
      concept('b'),
      concept('shared'),
    ];
    const edges = [
      edge('shared', 'a', 1),
      edge('shared', 'b', 1),
      edge('a', 't', 2),
      edge('b', 't', 1),
    ];
    const path = buildLearningPath({
      targetId: 't',
      concepts,
      edges,
      mastery: {},
    });
    expect(path[0]).toBe('shared');
    expect(path).toContain('a');
    expect(path).toContain('b');
    expect(path).toContain('t');
    expect(path.indexOf('a')).toBeLessThan(path.indexOf('t'));
    expect(path.indexOf('b')).toBeLessThan(path.indexOf('t'));
    // a has higher edge importance to t than b
    expect(path.indexOf('a')).toBeLessThan(path.indexOf('b'));
  });

  it('is stable for same-ready set by slug when importance ties', () => {
    const concepts = [
      concept('t'),
      concept('zebra', 'zebra'),
      concept('alpha', 'alpha'),
    ];
    const edges = [edge('zebra', 't', 1), edge('alpha', 't', 1)];
    const path = buildLearningPath({
      targetId: 't',
      concepts,
      edges,
      mastery: {},
    });
    expect(path[0]).toBe('alpha');
    expect(path[1]).toBe('zebra');
    expect(path[2]).toBe('t');
  });

  it('produces identical output for identical input', () => {
    const concepts = [
      concept('t'),
      concept('a'),
      concept('b'),
      concept('c'),
    ];
    const edges = [edge('a', 'c', 2), edge('b', 'c', 2), edge('c', 't', 1)];
    const mastery: MasteryByConcept = {};
    const args = { targetId: 't', concepts, edges, mastery };
    expect(buildLearningPath(args)).toEqual(buildLearningPath(args));
  });

  it('throws for unknown target', () => {
    expect(() =>
      buildLearningPath({
        targetId: 'missing',
        concepts: [concept('a')],
        edges: [],
        mastery: {},
      }),
    ).toThrow(/target|未知/i);
  });

  it('throws for cyclic graph', () => {
    const concepts = [concept('a'), concept('b')];
    const edges = [edge('a', 'b'), edge('b', 'a')];
    expect(() =>
      buildLearningPath({
        targetId: 'a',
        concepts,
        edges,
        mastery: {},
      }),
    ).toThrow();
  });

  it('different mastery states yield different paths', () => {
    const concepts = [concept('a'), concept('b'), concept('t')];
    const edges = [edge('a', 't', 1), edge('b', 't', 1)];
    const pathNone = buildLearningPath({
      targetId: 't',
      concepts,
      edges,
      mastery: {},
    });
    const pathPartial = buildLearningPath({
      targetId: 't',
      concepts,
      edges,
      mastery: { a: 0.95 },
    });
    expect(pathNone).toEqual(['a', 'b', 't']);
    expect(pathPartial).toEqual(['b', 't']);
  });

  it('respects custom threshold', () => {
    const concepts = [concept('t')];
    const mastery: MasteryByConcept = { t: 0.5 };
    expect(
      buildLearningPath({
        targetId: 't',
        concepts,
        edges: [],
        mastery,
        threshold: 0.4,
      }),
    ).toEqual([]);
    expect(
      buildLearningPath({
        targetId: 't',
        concepts,
        edges: [],
        mastery,
        threshold: 0.7,
      }),
    ).toEqual(['t']);
  });

  it('throws RangeError for invalid threshold', () => {
    const concepts = [concept('t')];
    const base = {
      targetId: 't',
      concepts,
      edges: [],
      mastery: {} as MasteryByConcept,
    };
    expect(() => buildLearningPath({ ...base, threshold: -0.1 })).toThrow(
      RangeError,
    );
    expect(() => buildLearningPath({ ...base, threshold: 1.1 })).toThrow(
      RangeError,
    );
    expect(() =>
      buildLearningPath({ ...base, threshold: Number.NaN }),
    ).toThrow(RangeError);
  });
});

import type { Concept, PrerequisiteEdge } from './knowledge';
import { validateKnowledgeGraph } from './knowledge';
import { MASTERY_THRESHOLD, type MasteryByConcept } from './mastery';

export type KnowledgeNodeState =
  | 'mastered'
  | 'current'
  | 'upcoming'
  | 'not-required';

export type KnowledgeEdgeState = 'satisfied' | 'active' | 'inactive';

export interface KnowledgeGraphNodeView {
  id: string;
  slug: string;
  title: string;
  titleEn?: string;
  difficulty: number;
  summary: string;
  score: number;
  state: KnowledgeNodeState;
  layer: number;
  pathIndex: number | null;
}

export interface KnowledgeGraphEdgeView {
  id: string;
  prerequisiteId: string;
  conceptId: string;
  state: KnowledgeEdgeState;
}

export interface KnowledgeGraphView {
  nodes: readonly KnowledgeGraphNodeView[];
  edges: readonly KnowledgeGraphEdgeView[];
  layers: readonly (readonly string[])[];
}

export interface BuildKnowledgeGraphViewInput {
  concepts: readonly Concept[];
  edges: readonly PrerequisiteEdge[];
  mastery: MasteryByConcept;
  learningPath: readonly string[];
  threshold?: number;
}

function isScore(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function computeLayers(
  concepts: readonly Concept[],
  edges: readonly PrerequisiteEdge[],
): Map<string, number> {
  const prerequisitesOf = new Map<string, string[]>();
  for (const concept of concepts) {
    prerequisitesOf.set(concept.id, []);
  }
  for (const edge of edges) {
    prerequisitesOf.get(edge.conceptId)?.push(edge.prerequisiteId);
  }

  const layerOf = new Map<string, number>();
  const visiting = new Set<string>();

  const visit = (id: string): number => {
    const cached = layerOf.get(id);
    if (cached !== undefined) {
      return cached;
    }
    if (visiting.has(id)) {
      throw new Error(`Cyclic dependency detected at node: ${id}`);
    }
    visiting.add(id);
    const prereqs = prerequisitesOf.get(id) ?? [];
    let layer = 0;
    for (const prerequisiteId of prereqs) {
      layer = Math.max(layer, visit(prerequisiteId) + 1);
    }
    visiting.delete(id);
    layerOf.set(id, layer);
    return layer;
  };

  for (const concept of concepts) {
    visit(concept.id);
  }
  return layerOf;
}

function nodeState(
  score: number,
  threshold: number,
  pathIndex: number | null,
): KnowledgeNodeState {
  if (score >= threshold) {
    return 'mastered';
  }
  if (pathIndex === 0) {
    return 'current';
  }
  if (pathIndex !== null) {
    return 'upcoming';
  }
  return 'not-required';
}

function edgeState(
  prerequisiteState: KnowledgeNodeState,
  conceptState: KnowledgeNodeState,
): KnowledgeEdgeState {
  if (prerequisiteState === 'mastered') {
    return 'satisfied';
  }
  const prerequisiteOnPath =
    prerequisiteState === 'current' || prerequisiteState === 'upcoming';
  const conceptOnPath =
    conceptState === 'current' || conceptState === 'upcoming';
  if (prerequisiteOnPath && conceptOnPath) {
    return 'active';
  }
  return 'inactive';
}

export function buildKnowledgeGraphView(
  input: BuildKnowledgeGraphViewInput,
): KnowledgeGraphView {
  const {
    concepts,
    edges,
    mastery,
    learningPath,
    threshold = MASTERY_THRESHOLD,
  } = input;

  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
    throw new RangeError(
      `Threshold must be a finite number between 0 and 1, got ${threshold}`,
    );
  }

  validateKnowledgeGraph(concepts, edges);

  const conceptById = new Map(concepts.map((concept) => [concept.id, concept]));

  const pathIndexById = new Map<string, number>();
  learningPath.forEach((id, index) => {
    if (!conceptById.has(id)) {
      throw new Error(`Unknown learningPath concept: ${id}`);
    }
    if (pathIndexById.has(id)) {
      throw new Error(`Duplicate learningPath concept: ${id}`);
    }
    pathIndexById.set(id, index);
  });

  for (const [conceptId, value] of Object.entries(mastery)) {
    if (!conceptById.has(conceptId)) {
      continue;
    }
    if (!isScore(value)) {
      throw new RangeError(
        `Mastery score must be between 0 and 1 for ${conceptId}, got ${value}`,
      );
    }
  }

  const layerOf = computeLayers(concepts, edges);

  const nodeViews: KnowledgeGraphNodeView[] = concepts.map((concept) => {
    const score = mastery[concept.id] ?? 0;
    const pathIndex = pathIndexById.get(concept.id) ?? null;
    const state = nodeState(score, threshold, pathIndex);
    const view: KnowledgeGraphNodeView = {
      id: concept.id,
      slug: concept.slug,
      title: concept.title,
      difficulty: concept.difficulty,
      summary: concept.summary,
      score,
      state,
      layer: layerOf.get(concept.id) ?? 0,
      pathIndex: state === 'mastered' ? null : pathIndex,
    };
    if (concept.titleEn !== undefined) {
      view.titleEn = concept.titleEn;
    }
    return view;
  });

  const stateById = new Map(
    nodeViews.map((node) => [node.id, node.state]),
  );

  const edgeViews: KnowledgeGraphEdgeView[] = edges.map((edge) => {
    const prerequisiteState = stateById.get(edge.prerequisiteId) ?? 'not-required';
    const conceptState = stateById.get(edge.conceptId) ?? 'not-required';
    return {
      id: `${edge.prerequisiteId}->${edge.conceptId}`,
      prerequisiteId: edge.prerequisiteId,
      conceptId: edge.conceptId,
      state: edgeState(prerequisiteState, conceptState),
    };
  });

  const maxLayer = nodeViews.reduce(
    (max, node) => Math.max(max, node.layer),
    0,
  );
  const layers: string[][] = Array.from({ length: maxLayer + 1 }, () => []);

  nodeViews.sort((a, b) => {
    if (a.layer !== b.layer) {
      return a.layer - b.layer;
    }
    const aPath = a.pathIndex;
    const bPath = b.pathIndex;
    if (aPath !== null && bPath !== null) {
      if (aPath !== bPath) {
        return aPath - bPath;
      }
    } else if (aPath !== null) {
      return -1;
    } else if (bPath !== null) {
      return 1;
    }
    return a.slug.localeCompare(b.slug);
  });

  for (const node of nodeViews) {
    layers[node.layer]?.push(node.id);
  }

  return {
    nodes: nodeViews,
    edges: edgeViews,
    layers: layers.map((ids) => [...ids]),
  };
}

export interface Concept {
  id: string;
  slug: string;
  title: string;
  titleEn?: string;
  domain: string;
  difficulty: number;
  summary: string;
}

export type ConceptLocale = 'zh' | 'en';

export function getConceptTitle(
  concept: Concept,
  locale: ConceptLocale,
): string {
  if (locale === 'en' && concept.titleEn) {
    return concept.titleEn;
  }
  return concept.title;
}

export interface PrerequisiteEdge {
  prerequisiteId: string;
  conceptId: string;
  importance: number;
}

export function validateKnowledgeGraph(
  concepts: readonly Concept[],
  edges: readonly PrerequisiteEdge[],
): void {
  const ids = new Set<string>();
  const slugs = new Set<string>();

  for (const concept of concepts) {
    if (ids.has(concept.id)) {
      throw new Error(`Knowledge graph has duplicate id: ${concept.id}`);
    }
    if (slugs.has(concept.slug)) {
      throw new Error(`Knowledge graph has duplicate slug: ${concept.slug}`);
    }
    if (
      !Number.isInteger(concept.difficulty) ||
      concept.difficulty < 1 ||
      concept.difficulty > 5
    ) {
      throw new Error(
        `Concept ${concept.id} has invalid difficulty: ${concept.difficulty}`,
      );
    }
    ids.add(concept.id);
    slugs.add(concept.slug);
  }

  const seenEdges = new Set<string>();
  for (const edge of edges) {
    if (!Number.isInteger(edge.importance) || edge.importance < 1) {
      throw new Error(
        `Edge ${edge.prerequisiteId}->${edge.conceptId} has invalid importance: ${edge.importance}`,
      );
    }
    if (!ids.has(edge.prerequisiteId)) {
      throw new Error(
        `Edge endpoint not found: prerequisite ${edge.prerequisiteId}`,
      );
    }
    if (!ids.has(edge.conceptId)) {
      throw new Error(`Edge endpoint not found: concept ${edge.conceptId}`);
    }
    if (edge.prerequisiteId === edge.conceptId) {
      throw new Error(`Self-loop edge is not allowed: ${edge.prerequisiteId}`);
    }
    const edgeKey = `${edge.prerequisiteId}->${edge.conceptId}`;
    if (seenEdges.has(edgeKey)) {
      throw new Error(`Duplicate edge is not allowed: ${edgeKey}`);
    }
    seenEdges.add(edgeKey);
  }

  const outgoing = new Map<string, string[]>();
  for (const edge of edges) {
    const list = outgoing.get(edge.prerequisiteId);
    if (list) {
      list.push(edge.conceptId);
    } else {
      outgoing.set(edge.prerequisiteId, [edge.conceptId]);
    }
  }

  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  for (const id of ids) {
    color.set(id, WHITE);
  }

  const visit = (id: string): void => {
    color.set(id, GRAY);
    for (const next of outgoing.get(id) ?? []) {
      const state = color.get(next);
      if (state === GRAY) {
        throw new Error(`Cyclic dependency detected at node: ${next}`);
      }
      if (state === WHITE) {
        visit(next);
      }
    }
    color.set(id, BLACK);
  };

  for (const id of ids) {
    if (color.get(id) === WHITE) {
      visit(id);
    }
  }
}

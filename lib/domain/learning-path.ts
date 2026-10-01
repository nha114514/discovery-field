import type { Concept, PrerequisiteEdge } from './knowledge';
import { validateKnowledgeGraph } from './knowledge';
import type { MasteryByConcept } from './mastery';

export interface BuildLearningPathInput {
  targetId: string;
  concepts: readonly Concept[];
  edges: readonly PrerequisiteEdge[];
  mastery: MasteryByConcept;
  threshold?: number;
}

export function buildLearningPath(input: BuildLearningPathInput): string[] {
  const { targetId, concepts, edges, mastery, threshold = 0.7 } = input;

  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
    throw new RangeError(
      `Threshold must be a finite number between 0 and 1, got ${threshold}`,
    );
  }

  validateKnowledgeGraph(concepts, edges);

  const conceptById = new Map(concepts.map((c) => [c.id, c]));
  if (!conceptById.has(targetId)) {
    throw new Error(`Unknown target concept: ${targetId}`);
  }

  if ((mastery[targetId] ?? 0) >= threshold) {
    return [];
  }

  const prerequisitesOf = new Map<string, string[]>();
  for (const edge of edges) {
    const list = prerequisitesOf.get(edge.conceptId);
    if (list) {
      list.push(edge.prerequisiteId);
    } else {
      prerequisitesOf.set(edge.conceptId, [edge.prerequisiteId]);
    }
  }

  const required = new Set<string>();
  const queue: string[] = [targetId];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) {
      break;
    }
    if (required.has(current)) {
      continue;
    }
    if ((mastery[current] ?? 0) >= threshold) {
      continue;
    }
    required.add(current);
    for (const prerequisite of prerequisitesOf.get(current) ?? []) {
      if (!required.has(prerequisite)) {
        queue.push(prerequisite);
      }
    }
  }

  const requiredEdges = edges.filter(
    (edge) =>
      required.has(edge.prerequisiteId) && required.has(edge.conceptId),
  );

  const importanceOf = new Map<string, number>();
  for (const edge of requiredEdges) {
    const current = importanceOf.get(edge.prerequisiteId) ?? 0;
    if (edge.importance > current) {
      importanceOf.set(edge.prerequisiteId, edge.importance);
    }
  }

  const indegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  for (const id of required) {
    indegree.set(id, 0);
    dependents.set(id, []);
  }
  for (const edge of requiredEdges) {
    indegree.set(edge.conceptId, (indegree.get(edge.conceptId) ?? 0) + 1);
    dependents.get(edge.prerequisiteId)?.push(edge.conceptId);
  }

  const ready = [...required]
    .filter((id) => (indegree.get(id) ?? 0) === 0)
    .sort(
      (a, b) =>
        (importanceOf.get(b) ?? 0) - (importanceOf.get(a) ?? 0) ||
        (conceptById.get(a)?.slug ?? a).localeCompare(
          conceptById.get(b)?.slug ?? b,
        ),
    );

  const path: string[] = [];
  while (ready.length > 0) {
    const current = ready.shift();
    if (current === undefined) {
      break;
    }
    path.push(current);
    for (const next of dependents.get(current) ?? []) {
      const remaining = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, remaining);
      if (remaining === 0) {
        ready.push(next);
      }
    }
    ready.sort(
      (a, b) =>
        (importanceOf.get(b) ?? 0) - (importanceOf.get(a) ?? 0) ||
        (conceptById.get(a)?.slug ?? a).localeCompare(
          conceptById.get(b)?.slug ?? b,
        ),
    );
  }

  if (path.length !== required.size) {
    throw new Error('Cyclic dependency detected in learning path subgraph');
  }

  return path;
}

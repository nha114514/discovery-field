import type { KnowledgeGraphView } from '../../lib/domain/knowledge-graph-view';

export interface AtlasPoint {
  x: number;
  y: number;
  orbit: 'focus' | 'prerequisite' | 'middle' | 'outer';
}

export const ATLAS_SIZE = { width: 800, height: 830, centerX: 400, centerY: 415 } as const;

/** A focus layout, not a claim that distance represents curricular difficulty. */
export function positionAtlasNodes(view: KnowledgeGraphView, selectedId: string): Map<string, AtlasPoint> {
  const positions = new Map<string, AtlasPoint>();
  positions.set(selectedId, { x: ATLAS_SIZE.centerX, y: ATLAS_SIZE.centerY, orbit: 'focus' });

  const prerequisites = view.edges
    .filter((edge) => edge.conceptId === selectedId)
    .map((edge) => edge.prerequisiteId);
  const nearby = prerequisites.filter((id) => view.nodes.some((node) => node.id === id));
  const attentionPoints: Record<string, { x: number; y: number }> = {
    vector: { x: 240, y: 350 },
    'dot-product': { x: 260, y: 520 },
    softmax: { x: 555, y: 520 },
  };
  nearby.forEach((id, index) => {
    const point = selectedId === 'attention' && nearby.length === 3
      ? attentionPoints[id]
      : {
          x: ATLAS_SIZE.centerX + Math.cos(-Math.PI / 2 + (index * 2 * Math.PI) / nearby.length) * 175,
          y: ATLAS_SIZE.centerY + Math.sin(-Math.PI / 2 + (index * 2 * Math.PI) / nearby.length) * 175,
        };
    positions.set(id, { ...point, orbit: 'prerequisite' });
  });

  const remaining = view.nodes.filter((node) => !positions.has(node.id));
  const outerCount = Math.ceil(remaining.length * 0.62);
  const outer = remaining.slice(0, outerCount);
  const middle = remaining.slice(outerCount);
  outer.forEach((node, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / outer.length;
    positions.set(node.id, {
      x: ATLAS_SIZE.centerX + Math.cos(angle) * 350,
      y: ATLAS_SIZE.centerY + Math.sin(angle) * 345,
      orbit: 'outer',
    });
  });
  middle.forEach((node, index) => {
    const angle = -Math.PI / 2 + Math.PI / 9 + (index * 2 * Math.PI) / middle.length;
    positions.set(node.id, {
      x: ATLAS_SIZE.centerX + Math.cos(angle) * 260,
      y: ATLAS_SIZE.centerY + Math.sin(angle) * 255,
      orbit: 'middle',
    });
  });
  return positions;
}

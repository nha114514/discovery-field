import { getConceptTitle } from '../lib/domain/knowledge';
import { transformerConcepts, transformerEdges } from '../lib/domain/transformer-graph';
import type { Locale } from '../lib/domain/learner-intake';

// A real prerequisite chain, shown as an illustration rather than a learner's progress.
const previewIds = ['numbers', 'vector', 'dot-product', 'attention', 'self-attention'] as const;
const positions = [
  { x: 72, y: 256 },
  { x: 208, y: 177 },
  { x: 344, y: 243 },
  { x: 480, y: 133 },
  { x: 616, y: 215 },
] as const;
const branchIds = ['probability', 'softmax'] as const;
const branchPositions = [
  { x: 162, y: 70 },
  { x: 347, y: 84 },
] as const;

function conceptFor(id: string) {
  const concept = transformerConcepts.find((item) => item.id === id);
  if (!concept) throw new Error(`Missing preview concept: ${id}`);
  return concept;
}

const previewConcepts = previewIds.map(conceptFor);
const branchConcepts = branchIds.map(conceptFor);

const shownEdges = [
  ...previewIds.slice(1).map((id, index) => [previewIds[index], id]),
  ['numbers', 'probability'],
  ['probability', 'softmax'],
  ['vector', 'softmax'],
  ['softmax', 'attention'],
];

for (const [from, to] of shownEdges) {
  const exists = transformerEdges.some(
    (edge) => edge.prerequisiteId === from && edge.conceptId === to,
  );
  if (!exists) throw new Error('Home preview must use real prerequisite edges');
}

export function HomeMapPreview({ locale }: { locale: Locale }) {
  return (
    <div className="home-map-preview" data-testid="home-map-preview" aria-hidden="true">
      <div className="home-map-grain" />
      <svg className="home-map-graphic" viewBox="0 0 700 370" fill="none" role="presentation">
        <path className="home-map-branch" d="M72 256C63 165 86 70 162 70S262 84 347 84 415 130 480 133M208 177C255 134 287 87 347 84" />
        <path className="home-map-base" d="M72 256C130 255 143 177 208 177S280 243 344 243 409 133 480 133s64 82 136 82" />
        <path className="home-map-route" d="M72 256C130 255 143 177 208 177S280 243 344 243 409 133 480 133s64 82 136 82" />
        {branchConcepts.map((concept, index) => (
          <g key={concept.id}>
            <circle className="home-map-branch-halo" cx={branchPositions[index].x} cy={branchPositions[index].y} r="20" />
            <circle className="home-map-branch-node" cx={branchPositions[index].x} cy={branchPositions[index].y} r="6" />
            <text className="home-map-branch-label" x={branchPositions[index].x} y={branchPositions[index].y - 34} textAnchor="middle">
              {getConceptTitle(concept, locale)}
            </text>
          </g>
        ))}
        {previewConcepts.map((concept, index) => (
          <g key={concept.id}>
            <circle className="home-map-halo" cx={positions[index].x} cy={positions[index].y} r="27" />
            <circle className="home-map-node" cx={positions[index].x} cy={positions[index].y} r="8" />
            <text className="home-map-label" x={positions[index].x} y={positions[index].y + (index % 2 === 0 ? 52 : -37)} textAnchor="middle">
              {getConceptTitle(concept, locale)}
            </text>
          </g>
        ))}
      </svg>
      <div className="home-map-mobile" aria-hidden="true">
        {previewConcepts.slice(0, 3).map((concept, index) => (
          <span key={concept.id} className="home-map-mobile-item">
            <i aria-hidden="true" />{getConceptTitle(concept, locale)}
            {index < 2 ? <b aria-hidden="true">→</b> : null}
          </span>
        ))}
      </div>
      <p className="home-map-caption">
        {locale === 'zh' ? '一条真实的前置知识链 · 完整图谱可在演示中查看' : 'One real prerequisite chain · see the full map in the demo'}
      </p>
    </div>
  );
}

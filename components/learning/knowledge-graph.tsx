'use client';

import { useMemo, useState } from 'react';
import { getConceptTitle } from '../../lib/domain/knowledge';
import { getLesson } from '../../lib/domain/lessons';
import type { Locale } from '../../lib/domain/learner-intake';
import type { KnowledgeGraphNodeView, KnowledgeGraphView, KnowledgeNodeState } from '../../lib/domain/knowledge-graph-view';
import type { EntryCopy } from '../../lib/i18n/copy';
import { ATLAS_SIZE, positionAtlasNodes } from './atlas-layout';

function titleFor(node: KnowledgeGraphNodeView, locale: Locale): string {
  return getConceptTitle({
    id: node.id, slug: node.slug, title: node.title, titleEn: node.titleEn,
    domain: 'transformer', difficulty: node.difficulty, summary: node.summary,
  }, locale);
}

function statusLabel(state: KnowledgeNodeState, copy: EntryCopy): string {
  switch (state) {
    case 'mastered': return copy.graph.status.mastered;
    case 'current': return copy.graph.status.current;
    case 'upcoming': return copy.graph.status.upcoming;
    case 'not-required': return copy.graph.status.notRequired;
  }
}

function connectionPath(x1: number, y1: number, x2: number, y2: number): string {
  const midpointX = (x1 + x2) / 2;
  const midpointY = (y1 + y2) / 2;
  const bend = Math.min(38, Math.hypot(x2 - x1, y2 - y1) * 0.08);
  return `M ${x1} ${y1} Q ${midpointX + bend} ${midpointY - bend} ${x2} ${y2}`;
}

export function KnowledgeGraph({
  view, locale, copy, selectedConceptId, onSelectNode, onStartLesson,
}: {
  view: KnowledgeGraphView;
  locale: Locale;
  copy: EntryCopy;
  selectedConceptId?: string | null;
  onSelectNode?: (conceptId: string) => void;
  onStartLesson?: (conceptId: string) => void;
}) {
  const nodeById = useMemo(() => new Map(view.nodes.map((node) => [node.id, node])), [view.nodes]);
  const defaultSelected = nodeById.has('attention') ? 'attention' : view.nodes[0]?.id ?? null;
  const [selectedId, setSelectedId] = useState<string | null>(defaultSelected);
  const preferredSelected = selectedConceptId ?? selectedId;
  const effectiveSelected = preferredSelected && nodeById.has(preferredSelected) ? preferredSelected : defaultSelected;
  const selected = effectiveSelected ? nodeById.get(effectiveSelected) : undefined;
  const positions = useMemo(() => positionAtlasNodes(view, effectiveSelected ?? ''), [view, effectiveSelected]);
  const prerequisites = selected
    ? view.edges.filter((edge) => edge.conceptId === selected.id)
        .map((edge) => nodeById.get(edge.prerequisiteId))
        .filter((node): node is KnowledgeGraphNodeView => node !== undefined)
    : [];
  const relatedIds = new Set(view.edges
    .filter((edge) => edge.conceptId === effectiveSelected || edge.prerequisiteId === effectiveSelected)
    .flatMap((edge) => [edge.prerequisiteId, edge.conceptId]));
  const recommended = view.nodes.find((node) => node.state === 'current');
  const explanation = selected?.id === 'attention'
    ? (locale === 'zh'
      ? '注意力让模型比较一段内容中的不同部分，把更相关的信息放在前面。'
      : 'Attention lets a model weigh different parts of a sequence, so it can focus on the information that matters most.')
    : selected ? getLesson(selected.id, locale)?.primaryExplanation : undefined;

  function selectNode(id: string) {
    setSelectedId(id);
    onSelectNode?.(id);
  }

  function nodeButton(node: KnowledgeGraphNodeView, mobile = false) {
    const isSelected = node.id === effectiveSelected;
    return (
      <button type="button" onClick={() => {
        selectNode(node.id);
        if (mobile && typeof document !== 'undefined') {
          document.getElementById('kg-detail-title')?.scrollIntoView({ block: 'center' });
        }
      }}
        aria-current={node.state === 'current' && !mobile ? 'step' : undefined}
        aria-pressed={isSelected} className="kg-node" data-state={node.state}
        data-selected={isSelected} data-related={relatedIds.has(node.id)}>
        <span className="kg-node-orbit" aria-hidden="true"><span className="kg-node-core" /></span>
        <span className="kg-node-title">{titleFor(node, locale)}</span>
        <span className="sr-only">{statusLabel(node.state, copy)}{node.id === 'transformer' ? ` · ${copy.graph.status.goal}` : ''}</span>
      </button>
    );
  }

  return (
    <section aria-labelledby="knowledge-graph-title" className="knowledge-atlas" data-atlas-layout="orbital">
      <div className="route-atlas-hero">
        <p className="atlas-eyebrow">{locale === 'zh' ? '从你现在的位置开始' : 'A CLEARER PATH TO UNDERSTANDING'}</p>
        <h2 id="knowledge-graph-title" aria-label={locale === 'zh' ? '从你会的地方，读懂 Transformer。' : 'Understand Transformers from where you are.'}>
          {locale === 'zh' ? '从你会的地方，读懂 Transformer。' : <>
            <span>Understand</span><span>Transformers</span><span>from where</span><span>you are.</span>
          </>}
        </h2>
        <p>{locale === 'zh'
          ? '点开任意知识点，看看它讲什么、与哪些内容有关，再决定下一步学什么。'
          : 'Explore a living map of ideas. Select any concept to see how it connects, what it means, and where you can go next.'}</p>
        <p className="route-atlas-hero-tip">{locale === 'zh' ? '点击知识点，沿着你的好奇心探索。' : 'Click any concept and follow your curiosity.'}</p>
      </div>

      <div className="knowledge-atlas-map">
        <p className="atlas-map-caption">{locale === 'zh' ? '知识之间的连接' : 'HOW THE IDEAS CONNECT'}</p>
        <div className="knowledge-atlas-scroll" role="region" aria-label={copy.graph.title} tabIndex={0}>
          <svg viewBox={`0 0 ${ATLAS_SIZE.width} ${ATLAS_SIZE.height}`} className="knowledge-atlas-svg">
            <g className="atlas-rings" aria-hidden="true">
              <ellipse cx="400" cy="415" rx="350" ry="345" />
              <ellipse cx="400" cy="415" rx="260" ry="255" />
              <ellipse cx="400" cy="415" rx="176" ry="175" />
            </g>
            <g aria-hidden="true">{view.edges.map((edge) => {
              const from = positions.get(edge.prerequisiteId);
              const to = positions.get(edge.conceptId);
              if (!from || !to) return null;
              const focused = edge.prerequisiteId === effectiveSelected || edge.conceptId === effectiveSelected;
              return <path key={edge.id} d={connectionPath(from.x, from.y, to.x, to.y)}
                fill="none" className="kg-edge" data-edge-focus={focused}
                data-edge-id={edge.id} data-edge-state={edge.state} />;
            })}</g>
            <g>{view.nodes.map((node) => {
              const pos = positions.get(node.id);
              if (!pos) return null;
              return <foreignObject key={node.id} x={pos.x - 66} y={pos.y - 25} width="132" height="108"
                data-graph-node={node.id} data-orbit={pos.orbit} data-node-state={node.state}>
                {nodeButton(node)}
              </foreignObject>;
            })}</g>
          </svg>
        </div>
        <div className="knowledge-atlas-mobile" role="region" aria-label={copy.graph.title} tabIndex={0}>
          {view.nodes.map((node) => <div key={node.id} data-mobile-concept={node.id}>{nodeButton(node, true)}</div>)}
        </div>
      </div>

      {selected ? <aside aria-labelledby="kg-detail-title" className="knowledge-atlas-inspector">
        <p className="atlas-eyebrow">{locale === 'zh' ? '知识点' : 'CONCEPT'}</p>
        <h3 id="kg-detail-title">{titleFor(selected, locale)}</h3>
        <p className="knowledge-atlas-description">{explanation}</p>
        <button type="button" className="knowledge-atlas-cta" onClick={() => onStartLesson?.(selected.id)}>
          {copy.graph.exploreLesson}<span aria-hidden="true">→</span>
        </button>
        <div className="knowledge-atlas-section">
          <h4>{locale === 'zh' ? '状态' : 'STATUS'}</h4>
          <p className="knowledge-atlas-status" data-state={selected.state}>
            <span aria-hidden="true" />{statusLabel(selected.state, copy)}
          </p>
          <p className="knowledge-atlas-step">{copy.graph.freeExploreNote}</p>
          {selected.score > 0 ? <p className="knowledge-atlas-step">{copy.graph.evidenceLabel}: {Math.round(selected.score * 100)}%</p> : null}
        </div>
        <div className="knowledge-atlas-section knowledge-atlas-prereqs">
          <h4>{copy.graph.prerequisitesLabel}</h4>
          {prerequisites.length > 0 ? <ul>{prerequisites.map((node) => <li key={node.id}>
            <button type="button" onClick={() => selectNode(node.id)}><span aria-hidden="true" />{titleFor(node, locale)}</button>
          </li>)}</ul> : <p>{copy.graph.noPrerequisites}</p>}
        </div>
        {recommended && recommended.id !== selected.id ? <div className="knowledge-atlas-section knowledge-atlas-recommended">
          <h4>{locale === 'zh' ? '建议下一站' : 'RECOMMENDED NEXT'}</h4>
          <button type="button" onClick={() => selectNode(recommended.id)}>{titleFor(recommended, locale)}<span aria-hidden="true">→</span></button>
        </div> : null}
      </aside> : null}
    </section>
  );
}

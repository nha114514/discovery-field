import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AttentionExplorer, attentionWeightsFor } from '../../components/learning/attention-explorer';

describe('AttentionExplorer', () => {
  it('uses internally consistent illustrative weights for every selected word', () => {
    for (const selected of [0, 1, 2] as const) {
      const weights = attentionWeightsFor(selected);
      expect(weights).toHaveLength(3);
      expect(weights.reduce((total, weight) => total + weight, 0)).toBe(100);
      expect(weights.every((weight) => weight > 0 && weight < 100)).toBe(true);
    }
  });

  it('labels the example as illustrative in both languages', () => {
    const en = renderToStaticMarkup(createElement(AttentionExplorer, { locale: 'en' }));
    const zh = renderToStaticMarkup(createElement(AttentionExplorer, { locale: 'zh' }));
    expect(en).toContain('Illustration, not a live model result');
    expect(zh).toContain('示意图，不是模型实测结果');
    expect(en).toContain('chases');
    expect(zh).toContain('追');
    expect(en.match(/aria-pressed=/g)).toHaveLength(3);
  });
});

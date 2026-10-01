import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TopicArticle } from '../../components/topic-article';
import type { ExploreArticle } from '../../lib/domain/topic-exploration';

const article: ExploreArticle = {
  title: '自注意力',
  lede: '按相关性汇集信息。',
  paragraphs: ['每个位置提出一个查询。', '它根据匹配程度汇集其他位置的信息。'],
  fable: {
    title: '钟楼里的信',
    paragraphs: ['小岚收到一袋信。', '她寻找与眼前问题有关的线索。', '她终于整理好了信件。'],
    reveal: '这个故事描述的是自注意力。',
    mappings: [
      { image: '小岚的问题', meaning: '查询向量' },
      { image: '信上的印章', meaning: '键向量' },
    ],
  },
  related: [{ topic: '向量', connection: '数值表示' }, { topic: 'Softmax', connection: '权重' }],
};

describe('TopicArticle', () => {
  it('lets the story end before the reveal, explanation, and metaphor mapping', () => {
    const html = renderToStaticMarkup(createElement(TopicArticle, { article, locale: 'zh' }));
    expect(html).toContain('<h1>钟楼里的信</h1>');
    const ending = html.indexOf('她终于整理好了信件。');
    const reveal = html.indexOf('这个故事描述的是自注意力。');
    const explanation = html.indexOf('每个位置提出一个查询。');
    const mapping = html.indexOf('查询向量');
    expect(ending).toBeLessThan(reveal);
    expect(reveal).toBeLessThan(explanation);
    expect(explanation).toBeLessThan(mapping);
    expect(html).not.toContain('textarea');
    expect(html).not.toContain('测验');
  });

  it('reads factual topics directly without an empty story or level controls', () => {
    const html = renderToStaticMarkup(createElement(TopicArticle, {
      article: { ...article, fable: null }, locale: 'en',
    }));
    expect(html).toContain('<h1>自注意力</h1>');
    expect(html).not.toContain('钟楼里的信');
    expect(html).not.toContain('Focused');
  });
});

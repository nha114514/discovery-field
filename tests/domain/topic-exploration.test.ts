import { describe, expect, it } from 'vitest';
import {
  ExploreRequestSchema,
  ExploreArticleSchema,
} from '../../lib/domain/topic-exploration';

describe('open-topic exploration contracts', () => {
  it('accepts any non-empty topic and trims surrounding whitespace', () => {
    expect(ExploreRequestSchema.parse({ topic: '  珊瑚礁  ', locale: 'zh' })).toEqual({
      topic: '珊瑚礁',
      locale: 'zh',
    });
    expect(ExploreRequestSchema.parse({ topic: 'Jazz improvisation', locale: 'en' }).topic)
      .toBe('Jazz improvisation');
  });

  it('rejects blank, oversized, or extra request fields', () => {
    expect(ExploreRequestSchema.safeParse({ topic: ' ', locale: 'zh' }).success).toBe(false);
    expect(ExploreRequestSchema.safeParse({ topic: 'x'.repeat(161), locale: 'zh' }).success).toBe(false);
    expect(ExploreRequestSchema.safeParse({ topic: '历史', locale: 'zh', score: 1 }).success).toBe(false);
  });

  it('requires coherent article text and explorable related topics', () => {
    const article = {
      title: '珊瑚礁',
      lede: '珊瑚礁是由微小动物长期建造的海底栖息地。',
      paragraphs: ['珊瑚虫会分泌坚硬的骨骼。', '这些骨骼一层层堆起来。', '海水变暖会让这个系统变得脆弱。'],
      fable: null,
      related: [
        { topic: '珊瑚白化', connection: '看看温度变化的影响' },
        { topic: '海洋生态系统', connection: '把珊瑚礁放进更大的环境里' },
      ],
    };
    expect(ExploreArticleSchema.safeParse(article).success).toBe(true);
    expect(ExploreArticleSchema.safeParse({ ...article, paragraphs: [] }).success).toBe(false);
    expect(ExploreArticleSchema.safeParse({ ...article, related: [] }).success).toBe(false);
    expect(ExploreArticleSchema.safeParse({ ...article, mastered: true }).success).toBe(false);
  });

  it('keeps a complete story, reveal, and metaphor mapping separate from the explanation', () => {
    const article = {
      title: '自注意力',
      lede: '按相关性汇集信息。',
      paragraphs: ['每个位置提出一个查询。', '它根据匹配程度汇集其他位置的信息。'],
      fable: {
        title: '钟楼里的信',
        paragraphs: ['小岚收到一袋信，却不知道先看哪一封。', '她让每封信带上一枚印章。', '她按印章与问题的关联，重新安排了阅读顺序。'],
        reveal: '这个故事描述的是自注意力。',
        mappings: [
          { image: '小岚的问题', meaning: '查询向量' },
          { image: '信上的印章', meaning: '键向量' },
        ],
      },
      related: [
        { topic: '向量', connection: '信息的数值表示' },
        { topic: 'Softmax', connection: '把分数转成权重' },
      ],
    };
    expect(ExploreArticleSchema.safeParse(article).success).toBe(true);
    expect(ExploreArticleSchema.safeParse({ ...article, fable: { title: '只有标题' } }).success).toBe(false);
  });
});

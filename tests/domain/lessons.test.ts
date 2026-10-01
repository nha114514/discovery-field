import { describe, expect, it } from 'vitest';
import { getAllLessons, validateLessons } from '../../lib/domain/lessons';
import { transformerConcepts } from '../../lib/domain/transformer-graph';

const conceptIds = transformerConcepts.map((c) => c.id);

describe('lessons', () => {
  const zhLessons = getAllLessons('zh');
  const enLessons = getAllLessons('en');

  it('zh and en each resolve exactly 25 concepts', () => {
    expect(zhLessons).toHaveLength(25);
    expect(enLessons).toHaveLength(25);
  });

  it('both locales have the same concept IDs and ordering', () => {
    const zhIds = zhLessons.map((l) => l.conceptId);
    const enIds = enLessons.map((l) => l.conceptId);
    expect(zhIds).toEqual(enIds);
    expect(new Set(zhIds).size).toBe(25);
    expect([...zhIds].sort()).toEqual([...conceptIds].sort());
  });

  it('both locales use the same correctIndex and choice count for every concept', () => {
    for (let i = 0; i < zhLessons.length; i++) {
      expect(zhLessons[i].quiz.correctIndex).toBe(enLessons[i].quiz.correctIndex);
      expect(zhLessons[i].quiz.choices.length).toBe(enLessons[i].quiz.choices.length);
    }
  });

  it('required localized fields and steps are non-empty', () => {
    for (const localeLessons of [zhLessons, enLessons]) {
      expect(() => validateLessons(localeLessons, conceptIds)).not.toThrow();
    }
  });

  it('English resolved lesson content contains no Chinese Han characters', () => {
    const hasChinese = (text: string) => /[\u4e00-\u9fa5]/.test(text);
    for (const lesson of enLessons) {
      expect(hasChinese(lesson.primaryExplanation)).toBe(false);
      expect(hasChinese(lesson.oneSentenceIdea)).toBe(false);
      expect(hasChinese(lesson.simpleExplanation)).toBe(false);
      expect(hasChinese(lesson.analogy)).toBe(false);
      expect(hasChinese(lesson.rigorousNote)).toBe(false);
      expect(hasChinese(lesson.workedExample)).toBe(false);
      expect(hasChinese(lesson.commonMistake)).toBe(false);
      expect(hasChinese(lesson.quiz.question)).toBe(false);
      expect(hasChinese(lesson.quiz.explanation)).toBe(false);
      for (const step of lesson.steps) {
        expect(hasChinese(step)).toBe(false);
      }
      for (const choice of lesson.quiz.choices) {
        expect(hasChinese(choice)).toBe(false);
      }
    }
  });

  it('all 25 lessons provide mutually distinct primary explanations across story, visual, and rigorous styles in both zh and en', () => {
    for (const localeLessons of [zhLessons, enLessons]) {
      for (const lesson of localeLessons) {
        const { story, visual, rigorous } = lesson.primaryExplanations;
        expect(story.trim().length).toBeGreaterThan(30);
        expect(visual.trim().length).toBeGreaterThan(30);
        expect(rigorous.trim().length).toBeGreaterThan(30);

        expect(story).not.toEqual(visual);
        expect(visual).not.toEqual(rigorous);
        expect(story).not.toEqual(rigorous);
      }
    }
  });

  it('English primary explanations for all three styles contain no Chinese Han characters', () => {
    const hasChinese = (text: string) => /[\u4e00-\u9fa5]/.test(text);
    for (const lesson of enLessons) {
      expect(hasChinese(lesson.primaryExplanations.story)).toBe(false);
      expect(hasChinese(lesson.primaryExplanations.visual)).toBe(false);
      expect(hasChinese(lesson.primaryExplanations.rigorous)).toBe(false);
    }
  });

  it('English primary explanations for all three styles contain no CJK punctuation or symbols', () => {
    const hasCjkPunctuation = (text: string) => /[\u3000-\u303F\uFF00-\uFFEF]/.test(text);
    for (const lesson of enLessons) {
      for (const [style, text] of Object.entries(lesson.primaryExplanations)) {
        expect(
          hasCjkPunctuation(text),
          `English lesson "${lesson.conceptId}" style "${style}" contains CJK punctuation`,
        ).toBe(false);
      }
    }
  });

  it('Attention has a bilingual fable that reveals the technical concept only after the story', () => {
    for (const locale of ['zh', 'en'] as const) {
      const lesson = getAllLessons(locale).find((item) => item.conceptId === 'attention');
      const fable = lesson?.fable;

      expect(fable).toBeDefined();
      if (!fable) continue;
      expect(fable.title.trim()).not.toBe('');
      expect(fable.story.length).toBeGreaterThanOrEqual(3);
      expect(fable.story.every((paragraph) => paragraph.trim().length > 40)).toBe(true);
      expect(fable.explanation.trim().length).toBeGreaterThan(80);
      expect(fable.metaphors.length).toBeGreaterThanOrEqual(5);
      expect(fable.metaphors.every(({ image, meaning }) => image.trim() && meaning.trim())).toBe(true);
      expect(fable.story.join(' ')).not.toMatch(locale === 'zh' ? /注意力|查询向量|键向量|值向量/ : /attention|query vector|key vector|value vector/i);
      expect(fable.reveal).toMatch(locale === 'zh' ? /缩放点积自注意力/ : /scaled dot-product self-attention/i);
    }
  });

  describe('technical accuracy & factual audits', () => {
    it('Softmax: clarifies that softmax does not guarantee calibrated probabilities', () => {
      const zhSoftmax = zhLessons.find((l) => l.conceptId === 'softmax')!;
      const enSoftmax = enLessons.find((l) => l.conceptId === 'softmax')!;

      expect(zhSoftmax.primaryExplanations.story).toContain('校准');
      expect(zhSoftmax.primaryExplanations.visual).toContain('校准');
      expect(zhSoftmax.primaryExplanations.rigorous).toContain('校准');

      expect(enSoftmax.primaryExplanations.story.toLowerCase()).toContain('calibrated');
      expect(enSoftmax.primaryExplanations.visual.toLowerCase()).toContain('calibrated');
      expect(enSoftmax.primaryExplanations.rigorous.toLowerCase()).toContain('calibrated');
    });

    it('Dot product: clarifies that magnitude depends on vector lengths/norms', () => {
      const zhDot = zhLessons.find((l) => l.conceptId === 'dot-product')!;
      const enDot = enLessons.find((l) => l.conceptId === 'dot-product')!;

      expect(zhDot.primaryExplanations.story).toMatch(/长度/);
      expect(zhDot.primaryExplanations.visual).toMatch(/长/);
      expect(zhDot.primaryExplanations.rigorous).toMatch(/模长|范数|长度/);

      expect(enDot.primaryExplanations.story.toLowerCase()).toMatch(/large the numbers|lengths/);
      expect(enDot.primaryExplanations.visual.toLowerCase()).toMatch(/long/);
      expect(enDot.primaryExplanations.rigorous.toLowerCase()).toMatch(/norms|lengths/);
    });

    it('Gradient descent: clarifies that it does not guarantee the lowest error or global minimum', () => {
      const zhGrad = zhLessons.find((l) => l.conceptId === 'gradient-descent')!;
      const enGrad = enLessons.find((l) => l.conceptId === 'gradient-descent')!;

      expect(zhGrad.primaryExplanations.story).toMatch(/不保证|全山最低/);
      expect(zhGrad.primaryExplanations.visual).toMatch(/局部极小值|无法保证/);
      expect(zhGrad.primaryExplanations.rigorous).toMatch(/不保证|局部极小点/);

      expect(enGrad.primaryExplanations.story.toLowerCase()).toContain('no guarantee');
      expect(enGrad.primaryExplanations.visual.toLowerCase()).toContain('no guarantee');
      expect(enGrad.primaryExplanations.rigorous.toLowerCase()).toContain('does not guarantee');
    });

    it('Attention & Self-attention: clarifies that attention does not guarantee correct pronoun resolution', () => {
      const zhAttn = zhLessons.find((l) => l.conceptId === 'attention')!;
      const enAttn = enLessons.find((l) => l.conceptId === 'attention')!;
      const zhSelf = zhLessons.find((l) => l.conceptId === 'self-attention')!;
      const enSelf = enLessons.find((l) => l.conceptId === 'self-attention')!;

      expect(zhAttn.primaryExplanations.story).toMatch(/不能保证.*理解代词|代词/);
      expect(enAttn.primaryExplanations.story.toLowerCase()).toMatch(/pronoun resolution/);

      expect(zhSelf.primaryExplanations.story).toMatch(/指代/);
      expect(enSelf.primaryExplanations.story.toLowerCase()).toMatch(/coreference/);
    });

    it('Layer norm & Residual connections: clarifies that they do not guarantee preventing training problems', () => {
      const zhNorm = zhLessons.find((l) => l.conceptId === 'layer-norm')!;
      const enNorm = enLessons.find((l) => l.conceptId === 'layer-norm')!;
      const zhRes = zhLessons.find((l) => l.conceptId === 'residual-connection')!;
      const enRes = enLessons.find((l) => l.conceptId === 'residual-connection')!;

      expect(zhNorm.primaryExplanations.story).toMatch(/并不能.*保证|消除/);
      expect(enNorm.primaryExplanations.story.toLowerCase()).toMatch(/cannot promise|cannot guarantee|no.*guarantee/);

      expect(zhRes.primaryExplanations.story).toMatch(/并不意味着.*彻底根除|并不保证/);
      expect(enRes.primaryExplanations.story.toLowerCase()).toMatch(/without guaranteeing|cannot guarantee|do not guarantee/);
    });

    it('Transformer: avoids promotional or absolute claims and acknowledges realistic constraints', () => {
      const zhTf = zhLessons.find((l) => l.conceptId === 'transformer')!;
      const enTf = enLessons.find((l) => l.conceptId === 'transformer')!;

      // Promotional words should be absent
      expect(zhTf.primaryExplanations.story).not.toMatch(/革命性|完美|无所不能|彻底解决/);
      expect(enTf.primaryExplanations.story.toLowerCase()).not.toMatch(/revolutionary|perfect|flawless/);

      // Realistic constraints are acknowledged
      expect(zhTf.primaryExplanations.story).toMatch(/长序列|显存|挑战|工程挑战/);
      expect(enTf.primaryExplanations.story.toLowerCase()).toMatch(/quadratic|hallucinations|challenges/);
      expect(zhTf.primaryExplanations.rigorous).toMatch(/二次方复杂度|幻觉/);
      expect(enTf.primaryExplanations.rigorous.toLowerCase()).toMatch(/quadratic|hallucinations/);
    });
  });

  it('rejects duplicate conceptId', () => {
    const duplicated = [...zhLessons, zhLessons[0]];
    expect(() => validateLessons(duplicated, conceptIds)).toThrow(/duplicate/i);
  });

  it('rejects unknown conceptId', () => {
    const fake = [...zhLessons];
    (fake as { conceptId: string }[])[0] = { ...zhLessons[0], conceptId: 'nope' };
    expect(() => validateLessons(fake, conceptIds)).toThrow(/unknown/i);
  });

  it('rejects missing concept', () => {
    expect(() => validateLessons(zhLessons.slice(0, 24), conceptIds)).toThrow(
      /missing/i,
    );
  });

  it('rejects invalid quiz index', () => {
    const broken = zhLessons.map((lesson, index) =>
      index === 0
        ? { ...lesson, quiz: { ...lesson.quiz, correctIndex: 99 } }
        : lesson,
    );
    expect(() => validateLessons(broken, conceptIds)).toThrow(/invalid quiz/i);
  });

  it('rejects empty steps or out-of-range step count', () => {
    const tooFew = zhLessons.map((lesson, index) =>
      index === 0 ? { ...lesson, steps: ['only-one'] } : lesson,
    );
    expect(() => validateLessons(tooFew, conceptIds)).toThrow(/steps/i);
  });
});

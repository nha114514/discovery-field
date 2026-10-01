import { describe, expect, it } from 'vitest';
import {
  DiagnoseRequestSchema,
  SEMANTIC_EVIDENCE_MIN_CONFIDENCE,
  SemanticDiagnosisSchema,
  diagnosisToMastery,
  selectAcceptedEvidence,
  type SemanticDiagnosis,
} from '../../lib/domain/semantic-diagnostic';

const validRequest = {
  goal: 'Transformer',
  locale: 'zh' as const,
  intake: {
    level: 'beginner' as const,
    explanationStyle: 'story' as const,
    answerMode: 'freeform' as const,
    learningOutcome: '想看懂注意力',
    priorKnowledgeAndConfusion: '我知道一点矩阵，但注意力总是看不懂。',
  },
};

function diagnosis(
  evidence: SemanticDiagnosis['evidence'],
  gaps: SemanticDiagnosis['gaps'] = [],
): SemanticDiagnosis {
  return {
    version: 1,
    summary: { zh: '总结', en: 'summary' },
    communicationStyle: 'plain',
    evidence,
    gaps,
  };
}

function evidence(overrides: Partial<SemanticDiagnosis['evidence'][number]> = {}) {
  return {
    conceptId: 'matrix',
    score: 0.7,
    confidence: 0.9,
    quote: '我知道一点矩阵',
    reason: { zh: '用户提到矩阵', en: 'user mentioned matrices' },
    ...overrides,
  };
}

const validIds = new Set(['matrix', 'attention', 'vector']);

describe('DiagnoseRequestSchema', () => {
  it('accepts a valid request', () => {
    expect(() => DiagnoseRequestSchema.parse(validRequest)).not.toThrow();
  });

  it('rejects extra fields on the root object', () => {
    expect(() =>
      DiagnoseRequestSchema.parse({ ...validRequest, extra: true }),
    ).toThrow();
  });

  it('rejects extra fields inside intake', () => {
    expect(() =>
      DiagnoseRequestSchema.parse({
        ...validRequest,
        intake: { ...validRequest.intake, nickname: 'x' },
      }),
    ).toThrow();
  });

  it('rejects overlong goal and freeform text', () => {
    expect(() =>
      DiagnoseRequestSchema.parse({
        ...validRequest,
        goal: 'a'.repeat(121),
      }),
    ).toThrow();
    expect(() =>
      DiagnoseRequestSchema.parse({
        ...validRequest,
        intake: {
          ...validRequest.intake,
          learningOutcome: 'b'.repeat(2001),
        },
      }),
    ).toThrow();
  });

  it('allows empty freeform fields for unsure flow', () => {
    const parsed = DiagnoseRequestSchema.parse({
      ...validRequest,
      intake: {
        ...validRequest.intake,
        answerMode: 'unsure',
        learningOutcome: '',
        priorKnowledgeAndConfusion: '',
      },
    });
    expect(parsed.intake.learningOutcome).toBe('');
  });
});

describe('SemanticDiagnosisSchema', () => {
  it('rejects score above 0.85', () => {
    expect(() =>
      SemanticDiagnosisSchema.parse(diagnosis([evidence({ score: 0.86 })])),
    ).toThrow();
  });

  it('rejects confidence outside 0..1', () => {
    expect(() =>
      SemanticDiagnosisSchema.parse(
        diagnosis([evidence({ confidence: 1.1 })]),
      ),
    ).toThrow();
    expect(() =>
      SemanticDiagnosisSchema.parse(
        diagnosis([evidence({ confidence: -0.1 })]),
      ),
    ).toThrow();
  });

  it('rejects summary missing zh or en', () => {
    expect(() =>
      SemanticDiagnosisSchema.parse({
        ...diagnosis([]),
        summary: { zh: '只有中文' },
      }),
    ).toThrow();
    expect(() =>
      SemanticDiagnosisSchema.parse({
        ...diagnosis([]),
        summary: { en: 'english only' },
      }),
    ).toThrow();
  });

  it('rejects more than 25 evidence items', () => {
    const many = Array.from({ length: 26 }, (_, index) =>
      evidence({ conceptId: `c${index}`, quote: `quote ${index}` }),
    );
    expect(() => SemanticDiagnosisSchema.parse(diagnosis(many))).toThrow();
  });
});

describe('diagnosisToMastery', () => {
  const source = '我知道一点矩阵，也了解 Attention 的大致想法。';

  it('converts a valid quote into mastery score', () => {
    const mastery = diagnosisToMastery(
      diagnosis([evidence({ conceptId: 'matrix', score: 0.7, quote: '我知道一点矩阵' })]),
      source,
      validIds,
    );
    expect(mastery.matrix).toBe(0.7);
  });

  it('matches quotes case-insensitively', () => {
    const mastery = diagnosisToMastery(
      diagnosis([
        evidence({ conceptId: 'attention', score: 0.6, quote: 'ATTENTION' }),
      ]),
      source,
      validIds,
    );
    expect(mastery.attention).toBe(0.6);
  });

  it('matches quotes with collapsed whitespace', () => {
    const mastery = diagnosisToMastery(
      diagnosis([
        evidence({
          conceptId: 'matrix',
          score: 0.5,
          quote: '  我知道一点   矩阵  ',
        }),
      ]),
      '我知道一点 矩阵，继续学习。',
      validIds,
    );
    expect(mastery.matrix).toBe(0.5);
  });

  it('ignores fabricated quotes not present in prior knowledge', () => {
    const mastery = diagnosisToMastery(
      diagnosis([
        evidence({
          conceptId: 'matrix',
          quote: '我精通所有矩阵运算和特征值分解',
        }),
      ]),
      source,
      validIds,
    );
    expect(mastery.matrix).toBeUndefined();
  });

  it('ignores unknown conceptId', () => {
    const mastery = diagnosisToMastery(
      diagnosis([evidence({ conceptId: 'unknown-node' })]),
      source,
      validIds,
    );
    expect(mastery).toEqual({});
  });

  it('ignores low-confidence evidence', () => {
    const mastery = diagnosisToMastery(
      diagnosis([
        evidence({
          confidence: SEMANTIC_EVIDENCE_MIN_CONFIDENCE - 0.01,
        }),
      ]),
      source,
      validIds,
    );
    expect(mastery).toEqual({});
  });

  it('keeps the evidence with highest score * confidence for one concept', () => {
    const mastery = diagnosisToMastery(
      diagnosis([
        evidence({ score: 0.7, confidence: 0.7, quote: '我知道一点矩阵' }),
        evidence({ score: 0.6, confidence: 0.95, quote: '矩阵' }),
      ]),
      source,
      validIds,
    );
    // 0.6 * 0.95 = 0.57 > 0.7 * 0.7 = 0.49
    expect(mastery.matrix).toBe(0.6);
  });

  it('does not put gaps into mastery', () => {
    const mastery = diagnosisToMastery(
      diagnosis([], [
        {
          conceptId: 'attention',
          reason: { zh: '缺少注意力', en: 'missing attention' },
        },
      ]),
      source,
      validIds,
    );
    expect(mastery).toEqual({});
  });

  it('returns empty object for empty evidence', () => {
    expect(diagnosisToMastery(diagnosis([]), source, validIds)).toEqual({});
  });

  it('does not mutate input diagnosis or arrays', () => {
    const input = diagnosis([
      evidence({ score: 0.8, confidence: 0.9, quote: '我知道一点矩阵' }),
    ]);
    const snapshot = JSON.parse(JSON.stringify(input)) as SemanticDiagnosis;
    diagnosisToMastery(input, source, validIds);
    expect(input).toEqual(snapshot);
    expect(input.evidence).toHaveLength(1);
  });

  it('clamps retained scores into 0..0.85', () => {
    const mastery = diagnosisToMastery(
      diagnosis([
        evidence({ score: 0.85, confidence: 0.9, quote: '我知道一点矩阵' }),
      ]),
      source,
      validIds,
    );
    expect(mastery.matrix).toBe(0.85);
  });
});

describe('selectAcceptedEvidence', () => {
  const source = '我知道一点矩阵，也了解 Attention 的大致想法。';

  it('returns only accepted evidence', () => {
    const accepted = selectAcceptedEvidence(
      diagnosis([
        evidence({ conceptId: 'matrix', score: 0.7, quote: '我知道一点矩阵' }),
        evidence({
          conceptId: 'vector',
          score: 0.8,
          quote: '我精通特征值分解和所有矩阵运算',
        }),
        evidence({
          conceptId: 'attention',
          score: 0.6,
          confidence: 0.5,
          quote: 'Attention',
        }),
        evidence({ conceptId: 'unknown', score: 0.8, quote: '矩阵' }),
      ]),
      source,
      validIds,
    );
    expect(accepted.map((item) => item.conceptId)).toEqual(['matrix']);
  });

  it('matches diagnosisToMastery scores for accepted items', () => {
    const d = diagnosis([
      evidence({ conceptId: 'matrix', score: 0.72, quote: '我知道一点矩阵' }),
      evidence({ conceptId: 'attention', score: 0.66, quote: 'ATTENTION' }),
    ]);
    const accepted = selectAcceptedEvidence(d, source, validIds);
    const mastery = diagnosisToMastery(d, source, validIds);
    for (const item of accepted) {
      expect(mastery[item.conceptId]).toBe(item.score);
    }
  });

  it('sorts by product descending then conceptId', () => {
    const accepted = selectAcceptedEvidence(
      diagnosis([
        evidence({
          conceptId: 'vector',
          score: 0.7,
          confidence: 0.8,
          quote: '向量是有序数值',
        }),
        evidence({
          conceptId: 'matrix',
          score: 0.6,
          confidence: 0.95,
          quote: '我知道一点矩阵',
        }),
      ]),
      '我知道一点矩阵，向量是有序数值。',
      validIds,
    );
    // 0.6*0.95=0.57 > 0.7*0.8=0.56
    expect(accepted.map((item) => item.conceptId)).toEqual([
      'matrix',
      'vector',
    ]);
  });

  it('does not mutate diagnosis', () => {
    const input = diagnosis([
      evidence({ conceptId: 'matrix', score: 0.7, quote: '我知道一点矩阵' }),
    ]);
    const snapshot = JSON.parse(JSON.stringify(input)) as SemanticDiagnosis;
    selectAcceptedEvidence(input, source, validIds);
    expect(input).toEqual(snapshot);
  });
});

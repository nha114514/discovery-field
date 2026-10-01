'use client';

import { useState } from 'react';
import type { Locale } from '../../lib/domain/learner-intake';

const illustrativeWeights = [
  [20, 65, 15],
  [45, 10, 45],
  [15, 65, 20],
] as const;

type WordIndex = 0 | 1 | 2;

export function attentionWeightsFor(index: WordIndex): readonly number[] {
  return illustrativeWeights[index];
}

const content = {
  en: {
    eyebrow: 'TRY THE IDEA',
    title: 'What does this word pay attention to?',
    instruction: 'Choose a word. The bars show one possible way to give the other words different importance.',
    words: ['Cat', 'chases', 'ball'],
    weight: 'Attention weight',
    note: 'Illustration, not a live model result',
  },
  zh: {
    eyebrow: '动手看看',
    title: '这个词在注意什么？',
    instruction: '点一个词。下面的长短条示意它可能怎样给其他词分配不同的重要程度。',
    words: ['猫', '追', '球'],
    weight: '注意力权重',
    note: '示意图，不是模型实测结果',
  },
} as const;

export function AttentionExplorer({ locale, onInteract }: { locale: Locale; onInteract?: () => void }) {
  const [selected, setSelected] = useState<WordIndex>(1);
  const copy = content[locale];
  const weights = attentionWeightsFor(selected);

  return (
    <section data-attention-explorer="true" className="attention-explorer" aria-labelledby="attention-explorer-title">
      <div className="attention-explorer-intro">
        <p className="atlas-eyebrow">{copy.eyebrow}</p>
        <h3 id="attention-explorer-title">{copy.title}</h3>
        <p>{copy.instruction}</p>
      </div>
      <div className="attention-explorer-workspace">
        <div className="attention-words" role="group" aria-label={copy.title}>
          {copy.words.map((word, index) => (
            <button
              key={word}
              type="button"
              aria-pressed={selected === index}
              onClick={() => {
                setSelected(index as WordIndex);
                onInteract?.();
              }}
              className="attention-word"
            >
              {word}
            </button>
          ))}
        </div>
        <div className="attention-bars" aria-live="polite">
          {copy.words.map((word, index) => (
            <div key={word} className="attention-bar-row">
              <span>{word}</span>
              <div className="attention-bar-track" aria-hidden="true">
                <div className="attention-bar-fill" style={{ transform: `scaleX(${weights[index] / 100})` }} />
              </div>
              <strong>{weights[index]}%</strong>
            </div>
          ))}
        </div>
      </div>
      <p className="attention-explorer-note">{copy.weight} · {copy.note}</p>
    </section>
  );
}

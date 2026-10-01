import { describe, expect, it } from 'vitest';
import type { ReactElement, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { OpenAnswerAssessment } from '../../components/learning/open-answer-assessment';
import { copy } from '../../lib/i18n/copy';

type OpenAnswerProps = Parameters<typeof OpenAnswerAssessment>[0];

function renderOpenAnswer(
  locale: 'zh' | 'en',
  overrides: Partial<OpenAnswerProps> = {},
) {
  return renderToStaticMarkup(
    createElement(OpenAnswerAssessment, {
      copy: copy[locale],
      locale,
      answerMode: 'freeform',
      answer: '',
      loading: false,
      error: null,
      assessment: null,
      isAccepted: false,
      onAnswerModeChange: () => undefined,
      onAnswerChange: () => undefined,
      onSubmit: () => undefined,
      onUseQuiz: () => undefined,
      onEdit: () => undefined,
      ...overrides,
    }),
  );
}

function createOpenAnswer(props: OpenAnswerProps): ReactElement {
  return OpenAnswerAssessment(props) as ReactElement;
}

function extractText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join('');
  }
  const el = node as { props?: { children?: ReactNode } };
  if (el.props && 'children' in el.props) {
    return extractText(el.props.children);
  }
  return '';
}

function findButtons(
  root: ReactNode,
): { text: string; onClick?: () => void }[] {
  const buttons: { text: string; onClick?: () => void }[] = [];
  const walk = (node: ReactNode): void => {
    if (node == null || typeof node === 'boolean') {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node !== 'object') {
      return;
    }
    const el = node as {
      type?: unknown;
      props?: { children?: ReactNode; onClick?: () => void };
    };
    if (el.type === 'button' && el.props) {
      buttons.push({
        text: extractText(el.props.children),
        onClick: el.props.onClick,
      });
    }
    if (el.props?.children !== undefined) {
      walk(el.props.children);
    }
  };
  walk(root);
  return buttons;
}

describe('OpenAnswerAssessment Component', () => {
  it('English open-answer UI contains no Chinese assessment chrome', () => {
    const html = renderOpenAnswer('en');
    expect(html).toContain(copy.en.lesson.openAnswer.title);
    expect(html).toContain(copy.en.lesson.openAnswer.explanation);
    expect(html).not.toContain(copy.zh.lesson.openAnswer.title);
    expect(html).not.toContain(copy.zh.lesson.openAnswer.explanation);
  });

  it('Chinese UI uses Chinese copy', () => {
    const html = renderOpenAnswer('zh');
    expect(html).toContain(copy.zh.lesson.openAnswer.title);
    expect(html).toContain(copy.zh.lesson.openAnswer.explanation);
    expect(html).not.toContain(copy.en.lesson.openAnswer.title);
  });

  it('all four answer modes are available', () => {
    const html = renderOpenAnswer('en');
    expect(html).toContain(copy.en.answerModes.freeform.label);
    expect(html).toContain(copy.en.answerModes.example.label);
    expect(html).toContain(copy.en.answerModes.steps.label);
    expect(html).toContain(copy.en.answerModes.technical.label);
  });

  it('loading disables submission', () => {
    const html = renderOpenAnswer('en', { loading: true, answer: 'My answer' });
    expect(html).toContain('disabled');
    expect(html).toContain(copy.en.lesson.openAnswer.loading);
  });

  it('accepted feedback and next step render', () => {
    const html = renderOpenAnswer('en', {
      isAccepted: true,
      assessment: {
        version: 1,
        conceptId: 'test',
        score: 1.0,
        confidence: 0.9,
        quote: 'test',
        feedback: { zh: 'zh fb', en: 'en fb' },
        nextStep: { zh: 'zh next', en: 'en next' },
      },
    });
    expect(html).toContain('en fb');
    expect(html).toContain('en next');
  });

  it('AI_NOT_CONFIGURED primary button calls onUseQuiz, not onEdit', () => {
    const onUseQuiz = () => undefined;
    const onEdit = () => undefined;
    let useQuizCalls = 0;
    let editCalls = 0;
    const tree = createOpenAnswer({
      copy: copy.en,
      locale: 'en',
      answerMode: 'freeform',
      answer: 'my draft',
      loading: false,
      error: 'AI_NOT_CONFIGURED',
      assessment: null,
      isAccepted: false,
      onAnswerModeChange: () => undefined,
      onAnswerChange: () => undefined,
      onSubmit: () => undefined,
      onUseQuiz: () => {
        useQuizCalls += 1;
        onUseQuiz();
      },
      onEdit: () => {
        editCalls += 1;
        onEdit();
      },
    });
    const buttons = findButtons(tree);
    const primary = buttons.find(
      (b) => b.text === copy.en.lesson.openAnswer.useQuiz,
    );
    expect(primary).toBeDefined();
    expect(primary?.onClick).toBeTypeOf('function');
    primary?.onClick?.();
    expect(useQuizCalls).toBe(1);
    expect(editCalls).toBe(0);
  });

  it('retryable error primary button calls onEdit', () => {
    let editCalls = 0;
    let useQuizCalls = 0;
    const tree = createOpenAnswer({
      copy: copy.en,
      locale: 'en',
      answerMode: 'freeform',
      answer: 'my draft',
      loading: false,
      error: 'AI_TIMEOUT',
      assessment: null,
      isAccepted: false,
      onAnswerModeChange: () => undefined,
      onAnswerChange: () => undefined,
      onSubmit: () => undefined,
      onUseQuiz: () => {
        useQuizCalls += 1;
      },
      onEdit: () => {
        editCalls += 1;
      },
    });
    const buttons = findButtons(tree);
    const retry = buttons.find((b) => b.text === copy.en.analysis.retry);
    expect(retry).toBeDefined();
    retry?.onClick?.();
    expect(editCalls).toBe(1);
    expect(useQuizCalls).toBe(0);
    const secondary = buttons.find(
      (b) => b.text === copy.en.lesson.openAnswer.useQuiz,
    );
    expect(secondary).toBeDefined();
    secondary?.onClick?.();
    expect(useQuizCalls).toBe(1);
  });
});

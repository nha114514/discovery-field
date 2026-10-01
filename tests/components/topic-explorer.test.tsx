import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TopicExplorer } from '../../components/topic-explorer';

describe('TopicExplorer', () => {
  it('shows an open-topic reading shell without quizzes or mastery controls', () => {
    const html = renderToStaticMarkup(createElement(TopicExplorer, {
      goal: '珊瑚礁',
      initialLocale: 'zh',
    }));
    expect(html).toContain('珊瑚礁');
    expect(html).toContain('name="goal"');
    expect(html).not.toContain('快捷测验');
    expect(html).not.toContain('掌握度');
    expect(html).not.toContain('课程详细程度');
  });
});

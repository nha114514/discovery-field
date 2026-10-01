import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HomeClient } from '../../components/home-client';

describe('HomeClient open-topic entry', () => {
  it('offers broad live topics without coming-soon gates', () => {
    const html = renderToStaticMarkup(createElement(HomeClient, { initialLocale: 'zh' }));
    expect(html).toContain('珊瑚礁');
    expect(html).toContain('丝绸之路');
    expect(html).toContain('量子纠缠');
    expect(html).toContain('href="/learn?goal=');
    expect(html).not.toContain('即将支持');
    expect(html).not.toContain('home-map-preview');
  });

  it('keeps a labeled search form and working English example links', () => {
    const html = renderToStaticMarkup(createElement(HomeClient, { initialLocale: 'en' }));
    expect(html).toContain('Discovery Field');
    expect(html).toContain('action="/learn"');
    expect(html).toContain('name="goal"');
    expect(html).toContain('name="locale" value="en"');
    expect(html).toContain('href="/learn?goal=Quantum%20entanglement&amp;locale=en"');
    expect(html).toContain('href="/learn?goal=The%20Silk%20Road&amp;locale=en"');
    expect(html).not.toContain('Coming soon');
  });

  it('has one main heading and a semantic list of starting points', () => {
    const html = renderToStaticMarkup(createElement(HomeClient, { initialLocale: 'zh' }));
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('<h2>可以从这些问题开始</h2>');
    expect(html.match(/<li>/g)).toHaveLength(6);
    expect(html).toContain('data-testid="language-toggle"');
  });
});

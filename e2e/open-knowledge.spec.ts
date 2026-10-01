import { expect, test, type Page } from '@playwright/test';
import type { ExploreArticle } from '../lib/domain/topic-exploration';

function articleFor(topic: string, locale: string): ExploreArticle {
  return {
    title: topic,
    lede: locale === 'zh' ? '从一个具体问题，看看它怎样发生。' : 'A concrete question and how it works.',
    paragraphs: locale === 'zh'
      ? ['这个现象涉及相互联系的过程。先看其中一部分怎样影响另一部分。', '一个例子可以说明这种联系，但不能代替证据或覆盖所有情形。', '继续阅读相关主题，可以从另一个角度理解这个问题。']
      : ['This phenomenon involves connected processes. Begin with how one part affects another.', 'A concrete example can illustrate the connection, but it cannot replace evidence or cover every case.', 'Related topics offer another angle on the same question.'],
    fable: null,
    related: [
      { topic: locale === 'zh' ? '海洋生态系统' : 'Marine ecosystems', connection: locale === 'zh' ? '把这个问题放进更大的环境' : 'Put the question in a wider context' },
      { topic: locale === 'zh' ? '气候变化' : 'Climate change', connection: locale === 'zh' ? '探索另一个相关过程' : 'Explore another connected process' },
    ],
  };
}

const fableArticle: ExploreArticle = {
  ...articleFor('Self-attention', 'en'),
  lede: 'Each position gathers information using weights computed from its query and the available keys.',
  paragraphs: ['Queries and keys produce compatibility scores; normalized scores weight the values.', 'The mechanism is not a measurement of human understanding. Masks can also restrict which positions may interact.'],
  fable: {
    title: 'The Letters in the Clock Tower',
    paragraphs: ['Mira inherited a tower full of undelivered letters. Reading them all in order left her unable to answer the villagers.', 'She asked each visitor to name their concern, then sorted the letters by the clues on their envelopes. Some were useful together, and others were irrelevant to the question.', 'At last she could assemble a useful reply. She still had to check the letters: a well-organized reply could contain a mistake.'],
    reveal: 'The story describes self-attention: information is gathered according to its relevance to a query.',
    mappings: [
      { image: 'The visitor’s concern', meaning: 'The query, compared with keys to compute weights.' },
      { image: 'The letters', meaning: 'Values combined using those weights; the story does not represent the learned vector calculations exactly.' },
    ],
  },
};

async function mockArticles(page: Page) {
  const requested: Array<{ topic: string; locale: string }> = [];
  await page.route('**/api/explore', async (route) => {
    const { topic, locale } = route.request().postDataJSON();
    requested.push({ topic, locale });
    await route.fulfill({ json: articleFor(topic, locale) });
  });
  return requested;
}

function watchReading(page: Page) {
  const external: string[] = [];
  const assessments: string[] = [];
  const issues: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!['data:', 'blob:'].includes(url.protocol) && url.origin !== 'http://127.0.0.1:3000') {
      external.push(request.url());
    }
    if (['/api/diagnose', '/api/assess'].includes(url.pathname)) assessments.push(url.pathname);
  });
  page.on('pageerror', (error) => issues.push(error.message));
  page.on('console', (message) => {
    if (['warning', 'error'].includes(message.type()) && !message.text().includes('React DevTools')) {
      issues.push(message.text());
    }
  });
  return { external, assessments, issues };
}

async function expectCleanReader(page: Page) {
  await expect(page.locator('textarea, input[type="radio"]')).toHaveCount(0);
  await expect(page.getByText(/Quick quiz|课程详细程度|答对了|掌握度/)).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
}

for (const width of [1440, 1024, 768, 390]) {
  test(`open reading across topics and languages at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    const requested = await mockArticles(page);
    const observed = watchReading(page);
    await page.goto('/?locale=en');
    await expect(page.getByRole('heading', { name: 'Start with what you are curious about.' })).toBeVisible();
    await expect(page.locator('.discovery-samples a')).toHaveCount(6);
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    const input = page.getByRole('searchbox');
    await input.fill('Why do coral reefs bleach?');
    await page.getByTestId('language-toggle').click();
    await expect(input).toHaveValue('Why do coral reefs bleach?');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    await page.getByTestId('language-toggle').click();
    await expect(input).toHaveValue('Why do coral reefs bleach?');
    await page.screenshot({ path: testInfo.outputPath(`home-${width}.png`), fullPage: true });
    await page.getByRole('button', { name: 'Start reading' }).click();
    await expect(page.locator('article h1')).toHaveText('Why do coral reefs bleach?');
    await expectCleanReader(page);
    await page.screenshot({ path: testInfo.outputPath(`reader-${width}.png`), fullPage: true });
    await page.getByTestId('language-toggle').click();
    await expect(page.getByRole('heading', { name: '顺着读下去' })).toBeVisible();
    await expect(page.locator('article .reader-lede')).toContainText('具体问题');
    const count = requested.length;
    await page.getByRole('searchbox').fill('A question to read next');
    await page.getByTestId('language-toggle').click();
    await expect(page.locator('article .reader-lede')).toContainText('A concrete question');
    await expect(page.getByRole('searchbox')).toHaveValue('A question to read next');
    expect(requested).toHaveLength(count);
    await page.getByTestId('language-toggle').click();
    await expect(page.locator('article .reader-lede')).toContainText('具体问题');
    expect(requested).toHaveLength(count);
    await page.getByRole('link', { name: /海洋生态系统/ }).click();
    await expect(page.locator('article h1')).toHaveText('海洋生态系统');
    await expectCleanReader(page);
    expect(observed.external).toEqual([]);
    expect(observed.assessments).toEqual([]);
    expect(observed.issues).toEqual([]);
  });
}

test('a fable ends before the real concept and metaphor explanation', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/explore', (route) => route.fulfill({ json: fableArticle }));
  await page.goto('/learn?goal=Self-attention&locale=en');
  await expect(page.locator('article h1')).toHaveText('The Letters in the Clock Tower');
  await expect(page.locator('.reader-story p')).toHaveCount(3);
  await expect(page.locator('.reader-story')).not.toContainText('self-attention');
  const order = await page.locator('article').evaluate((element) => {
    const text = element.textContent ?? '';
    return {
      end: text.indexOf('a well-organized reply could contain a mistake.'),
      reveal: text.indexOf('The story describes self-attention'),
      explanation: text.indexOf('Queries and keys produce'),
      mapping: text.indexOf('The visitor’s concern'),
    };
  });
  expect(order.end).toBeLessThan(order.reveal);
  expect(order.reveal).toBeLessThan(order.explanation);
  expect(order.explanation).toBeLessThan(order.mapping);
  await expectCleanReader(page);
  await page.screenshot({ path: testInfo.outputPath('fable-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expectCleanReader(page);
  await page.screenshot({ path: testInfo.outputPath('fable-mobile.png'), fullPage: true });
});

test('an unavailable service offers retry and never falls back to a learner test', async ({ page }) => {
  let available = false;
  await page.route('**/api/explore', async (route) => {
    await route.fulfill(available
      ? { json: articleFor('爵士乐即兴演奏', 'zh') }
      : { status: 503, json: { code: 'AI_NOT_CONFIGURED' } });
  });
  await page.goto('/learn?goal=爵士乐即兴演奏&locale=zh');
  await expect(page.locator('section[role="alert"]')).toContainText('尚未配置 AI 服务');
  await expectCleanReader(page);
  available = true;
  await page.getByRole('button', { name: '再试一次' }).click();
  await expect(page.locator('article h1')).toHaveText('爵士乐即兴演奏');
});

test('an empty topic has an inviting entry and makes no model request', async ({ page }) => {
  const calls: string[] = [];
  await page.route('**/api/explore', async (route) => {
    calls.push(route.request().url());
    await route.fulfill({ json: articleFor('unused', 'en') });
  });
  await page.goto('/learn?locale=en');
  await expect(page.getByRole('heading', { name: 'Start with a question' })).toBeVisible();
  await expect(page.locator('.reader-empty-links a')).toHaveCount(3);
  expect(calls).toEqual([]);
});

test('malformed output is rejected instead of rendering a success message', async ({ page }) => {
  await page.route('**/api/explore', (route) => route.fulfill({ json: { title: 'broken', correct: true } }));
  await page.goto('/learn?goal=Transformer&locale=zh');
  await expect(page.locator('section[role="alert"]')).toContainText('文章格式无法读取');
  await expectCleanReader(page);
  await expect(page.locator('article')).toHaveCount(0);
});

test('old mastery storage cannot impose an intake or lock any topic', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('gibc_v2_session_transformer', JSON.stringify({ step: 'challenge', mastery: {} }));
  });
  await mockArticles(page);
  await page.goto('/learn?goal=丝绸之路&locale=zh');
  await expect(page.locator('article h1')).toHaveText('丝绸之路');
  await expectCleanReader(page);
  await expect(page.getByText('Tell us where you are')).toHaveCount(0);
});

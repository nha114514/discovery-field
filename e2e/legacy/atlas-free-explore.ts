import { expect, test } from '@playwright/test';

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900, selector: '[data-graph-node="attention"] button' },
  { name: 'mobile', width: 390, height: 844, selector: '[data-mobile-concept="attention"] button' },
] as const) {
  test(`${viewport.name}: an upcoming concept is freely explorable without mastery evidence`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/learn?goal=Transformer&locale=en');
    await page.getByRole('radio', { name: 'Not sure how to answer' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Skip and build my path' }).click();
    await expect(page.locator('ol#learning-path-list > li')).toHaveCount(25);

    if (viewport.name === 'desktop') {
      const focusedNodeFits = await page.locator('[data-graph-node="attention"]').evaluate((node) => {
        const button = node.querySelector('button');
        return !!button && button.scrollHeight <= node.clientHeight;
      });
      expect(focusedNodeFits).toBe(true);
    }

    const beliefBefore = await page.evaluate(() => {
      const raw = localStorage.getItem('gibc_v2_session_transformer');
      if (!raw) throw new Error('Expected persisted learning session');
      return JSON.parse(raw).learnerBelief;
    });

    await page.locator(viewport.selector).click();
    await expect(page.getByRole('heading', { name: 'Attention', level: 3 })).toBeVisible();
    const inspector = page.locator('.knowledge-atlas-inspector');
    for (const prerequisite of ['Vectors', 'Dot Product', 'Softmax']) {
      await expect(inspector.getByRole('button', { name: prerequisite })).toBeVisible();
    }
    await inspector.getByRole('button', { name: 'Explore lesson' }).click();
    await expect(page.getByRole('heading', { name: 'The Letters in the Clock Tower', level: 2 })).toBeVisible();
    await expect(page.locator('[data-fable-article]')).toContainText('scaled dot-product self-attention');
    const illustration = page.locator('[data-attention-explorer]');
    await expect(illustration.getByText('Illustration, not a live model result')).toBeVisible();
    await illustration.getByRole('button', { name: 'Cat' }).click();
    await expect(illustration.getByRole('button', { name: 'Cat' })).toHaveAttribute('aria-pressed', 'true');
    await expect(illustration.locator('.attention-bar-row').first()).toContainText('20%');
    await page.getByTestId('language-toggle').click();
    await expect(illustration.getByRole('button', { name: '猫' })).toHaveAttribute('aria-pressed', 'true');
    await expect(illustration.getByText('示意图，不是模型实测结果')).toBeVisible();

    await page.getByRole('button', { name: '返回知识地图' }).click();
    await expect(page.getByRole('heading', { name: '你的学习路线', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: '注意力', level: 3 })).toBeVisible();

    await expect.poll(async () => page.evaluate(() => {
      const raw = localStorage.getItem('gibc_v2_session_transformer');
      if (!raw) throw new Error('Expected persisted learning session');
      return JSON.parse(raw).learnerBelief.interactionCount;
    })).toBe(beliefBefore.interactionCount + 5);
    const beliefAfter = await page.evaluate(() => JSON.parse(
      localStorage.getItem('gibc_v2_session_transformer')!,
    ).learnerBelief);
    expect(beliefAfter.mastery).toEqual(beliefBefore.mastery);
    expect(beliefAfter.knowledgeEvidenceCount).toBe(beliefBefore.knowledgeEvidenceCount);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}

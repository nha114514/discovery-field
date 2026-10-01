import { test, expect, type Page } from '@playwright/test';

test.describe('Session Persistence and Hardening', () => {
  function attachNetworkAndConsoleListeners(page: Page) {
    const errors: string[] = [];
    const requests: string[] = [];

    page.on('pageerror', (err) => {
      errors.push(`PageError: ${err.message}`);
    });

    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'warning' && text.includes('React DevTools')) return;
      if (type === 'warning' && text.includes('Fast Refresh')) return;

      if (type === 'error' || type === 'warning') {
        errors.push(`Console ${type}: ${text}`);
      }
    });

    page.on('requestfailed', (req) => {
      errors.push(`RequestFailed: ${req.url()}`);
    });

    page.on('request', (req) => {
      const url = req.url();
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol === 'data:' || parsedUrl.protocol === 'blob:') return;

        if (parsedUrl.origin !== 'http://127.0.0.1:3000') {
          errors.push(`ThirdPartyRequest: ${url}`);
        }

        if (parsedUrl.pathname === '/api/diagnose' || parsedUrl.pathname === '/api/assess') {
          requests.push(url);
        }
      } catch {
        errors.push(`InvalidURL: ${url}`);
      }
    });

    return { errors, requests };
  }

  test('Draft intake persistence', async ({ page }) => {
    const watchers = attachNetworkAndConsoleListeners(page);
    await page.goto('/learn?goal=Transformer&locale=en');
    await expect(page.getByRole('heading', { name: 'Tell us where you are', level: 1 })).toBeVisible();

    // Change intake state
    await page.getByRole('radio', { name: 'Know a little' }).check();
    await page.getByPlaceholder('Write whatever comes to mind in everyday language.').fill('To master it deeply');
    await page.getByPlaceholder('For example: I know a bit of matrices, but attention still confuses me.').fill('I am very confused');

    // Do NOT press continue. Reload.
    await page.reload();

    // Verify it was restored
    await expect(page.getByRole('heading', { name: 'Tell us where you are', level: 1 })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Know a little' })).toBeChecked();
    await expect(page.getByPlaceholder('Write whatever comes to mind in everyday language.')).toHaveValue('To master it deeply');
    await expect(page.getByPlaceholder('For example: I know a bit of matrices, but attention still confuses me.')).toHaveValue('I am very confused');

    expect(watchers.errors).toEqual([]);
    expect(watchers.requests).toEqual([]);
  });

  test('Earn mastery, reload, and confirm route length and mastered-node state persist', async ({ page }) => {
    const watchers = attachNetworkAndConsoleListeners(page);
    await page.goto('/learn?goal=Transformer&locale=en');

    await page.getByRole('radio', { name: 'Not sure how to answer' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Skip' }).click();
    await expect(page.getByRole('heading', { name: 'Your learning path', level: 1 })).toBeVisible();

    // Verify initial route length is 25
    await expect(page.locator('ol > li')).toHaveCount(25);

    // Open lesson "Numbers"
    const numbersButton = page.locator('[data-graph-node="numbers"] button');
    await numbersButton.click();
    await page.getByRole('button', { name: 'Start this lesson' }).first().click();
    await expect(page.getByRole('heading', { name: 'Numbers', level: 2 })).toBeVisible();

    // Earn mastery
    await page.getByRole('button', { name: 'Use quick quiz instead' }).click();
    await page.getByRole('radio', { name: 'The quantity of pencils in a backpack' }).check();
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await page.getByRole('button', { name: 'View updated path' }).click();

    await expect(page.getByRole('heading', { name: 'Your learning path', level: 1 })).toBeVisible();

    // Verify path count is 24
    await expect(page.locator('ol > li')).toHaveCount(24);

    // Verify graph node
    const numbersNode = page.locator('[data-graph-node="numbers"]');
    await expect(numbersNode).toHaveAttribute('data-node-state', 'mastered');

    // Reload
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Your learning path', level: 1 })).toBeVisible();

    // Verify path count is 24 again
    await expect(page.locator('ol > li')).toHaveCount(24);
    await expect(numbersNode).toHaveAttribute('data-node-state', 'mastered');

    expect(watchers.errors).toEqual([]);
    expect(watchers.requests).toEqual([]);
  });

  test('Restart lifecycle', async ({ page }) => {
    const watchers = attachNetworkAndConsoleListeners(page);
    await page.goto('/learn?goal=Transformer&locale=en');

    // Dirty the state
    await page.getByRole('radio', { name: 'Not sure how to answer' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Skip' }).click();
    await expect(page.getByRole('heading', { name: 'Your learning path', level: 1 })).toBeVisible();

    // Restart
    await page.getByRole('button', { name: 'Diagnose again' }).click();
    await expect(page.getByRole('heading', { name: 'Tell us where you are', level: 1 })).toBeVisible();

    // Poll until key is removed (handle effect timing)
    await expect.poll(async () => {
      return page.evaluate(() => window.localStorage.getItem('gibc_v2_session_transformer'));
    }).toBeNull();

    // Reload
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Tell us where you are', level: 1 })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Not sure how to answer' })).not.toBeChecked(); // default is freeform

    // Edit intake again to trigger save
    await page.getByRole('radio', { name: 'Know a little' }).check();
    await page.getByPlaceholder('Write whatever comes to mind in everyday language.').fill('Second session outcome');

    // Reload
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Tell us where you are', level: 1 })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Know a little' })).toBeChecked();
    await expect(page.getByPlaceholder('Write whatever comes to mind in everyday language.')).toHaveValue('Second session outcome');

    expect(watchers.errors).toEqual([]);
    expect(watchers.requests).toEqual([]);
  });

  test('Two goals (Transformer, Understand Transformer), no contamination', async ({ page }) => {
    const watchers = attachNetworkAndConsoleListeners(page);
    await page.goto('/learn?goal=Transformer&locale=en');
    await page.getByRole('radio', { name: 'Know a little' }).check();
    await page.getByPlaceholder('For example: I know a bit of matrices, but attention still confuses me.').fill('Only for Transformer');

    await page.goto('/learn?goal=Understand+Transformer&locale=en');
    await expect(page.getByRole('heading', { name: 'Tell us where you are', level: 1 })).toBeVisible();
    await expect(page.getByPlaceholder('For example: I know a bit of matrices, but attention still confuses me.')).not.toHaveValue('Only for Transformer');
    await page.getByPlaceholder('For example: I know a bit of matrices, but attention still confuses me.').fill('Only for Understand Transformer');

    await page.goto('/learn?goal=Transformer&locale=en');
    await expect(page.getByRole('heading', { name: 'Tell us where you are', level: 1 })).toBeVisible();
    await expect(page.getByPlaceholder('For example: I know a bit of matrices, but attention still confuses me.')).toHaveValue('Only for Transformer');

    expect(watchers.errors).toEqual([]);
    expect(watchers.requests).toEqual([]);
  });

  test('SSR shell with JS disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    await page.goto('/learn?goal=Transformer&locale=en');

    const main = page.locator('main[aria-busy="true"]');
    await expect(main).toBeVisible();
    await expect(page.locator('span.sr-only')).toHaveText('Understanding where you are');

    await context.close();
  });

  test('Verify 390x844 has no page-level overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/learn?goal=Transformer&locale=en');

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow).toBe(false);
  });

  test('Corrupted or schema-invalid localStorage payload', async ({ page }) => {
    const watchers = attachNetworkAndConsoleListeners(page);
    await page.goto('/learn?goal=Transformer&locale=en');

    await page.evaluate(() => {
      window.localStorage.setItem('gibc_v2_session_transformer', JSON.stringify({
        version: 1, goal: 'transformer', step: 'invalid_step', garbage: true
      }));
    });

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Tell us where you are', level: 1 })).toBeVisible();

    const stored = await page.evaluate(() => window.localStorage.getItem('gibc_v2_session_transformer'));
    expect(stored).toBeNull();

    expect(watchers.errors).toEqual([]);
    expect(watchers.requests).toEqual([]);
  });

  test('Transient-step normalization (analyzing -> prefs, challenge -> challenge-intro)', async ({ page }) => {
    const watchers = attachNetworkAndConsoleListeners(page);
    await page.goto('/learn?goal=Transformer&locale=en');

    await page.evaluate(() => {
      const state = {
        version: 1,
        goal: 'transformer',
        step: 'analyzing',
        activeConceptId: null,
        intake: { level: 'beginner', explanationStyle: 'story', answerMode: 'freeform', learningOutcome: 'test', priorKnowledgeAndConfusion: 'test' },
        learnerBelief: { stage: { beginner: 1, some: 0, solid: 0 }, mastery: {}, conceptEvidence: {}, knowledgeEvidenceCount: 0, interactionCount: 0, stableLevel: 'beginner', pendingLevel: null, pendingLevelCount: 0 }
      };
      window.localStorage.setItem('gibc_v2_session_transformer', JSON.stringify(state));
    });

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Tell us where you are', level: 1 })).toBeVisible();

    await page.evaluate(() => {
      const state = JSON.parse(window.localStorage.getItem('gibc_v2_session_transformer')!);
      state.step = 'challenge';
      window.localStorage.setItem('gibc_v2_session_transformer', JSON.stringify(state));
    });

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Want a short optional challenge?', level: 1 })).toBeVisible();

    expect(watchers.errors).toEqual([]);
    expect(watchers.requests).toEqual([]);
  });

  test('Invalid lesson restoration (lesson + null activeConceptId -> route)', async ({ page }) => {
    const watchers = attachNetworkAndConsoleListeners(page);
    await page.goto('/learn?goal=Transformer&locale=en');

    await page.evaluate(() => {
      const state = {
        version: 1,
        goal: 'transformer',
        step: 'lesson',
        activeConceptId: null,
        intake: { level: 'beginner', explanationStyle: 'story', answerMode: 'freeform', learningOutcome: 'test', priorKnowledgeAndConfusion: 'test' },
        learnerBelief: { stage: { beginner: 1, some: 0, solid: 0 }, mastery: {}, conceptEvidence: {}, knowledgeEvidenceCount: 0, interactionCount: 0, stableLevel: 'beginner', pendingLevel: null, pendingLevelCount: 0 }
      };
      window.localStorage.setItem('gibc_v2_session_transformer', JSON.stringify(state));
    });

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Your learning path', level: 1 })).toBeVisible();

    expect(watchers.errors).toEqual([]);
    expect(watchers.requests).toEqual([]);
  });
});

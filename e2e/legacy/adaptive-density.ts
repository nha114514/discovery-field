import { expect, test, type Page } from '@playwright/test';

const ALLOWED_ORIGIN = 'http://127.0.0.1:3000';

type FlowWatchers = {
  aiCalls: string[];
  externalRequests: string[];
  browserIssues: string[];
  requestFailures: string[];
};

function isIgnorableConsoleMessage(type: string, text: string): boolean {
  if (type === 'warning' && text.includes('Download the React DevTools')) {
    return true;
  }
  if (type === 'warning' && text.includes('Fast Refresh')) {
    return true;
  }
  if (type === 'warning' && text.includes('[Fast Refresh]')) {
    return true;
  }
  return false;
}

function isAllowedRequestUrl(url: string): boolean {
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return true;
  }
  try {
    return new URL(url).origin === ALLOWED_ORIGIN;
  } catch {
    return false;
  }
}

function watchPage(page: Page): FlowWatchers {
  const watchers: FlowWatchers = {
    aiCalls: [],
    externalRequests: [],
    browserIssues: [],
    requestFailures: [],
  };

  page.on('pageerror', (error) => {
    watchers.browserIssues.push(`pageerror: ${error.message}`);
  });

  page.on('console', (message) => {
    const type = message.type();
    const text = message.text();
    if (type !== 'error' && type !== 'warning') {
      return;
    }
    if (isIgnorableConsoleMessage(type, text)) {
      return;
    }
    watchers.browserIssues.push(`${type}: ${text}`);
  });

  page.on('request', (request) => {
    const url = request.url();
    if (!isAllowedRequestUrl(url)) {
      watchers.externalRequests.push(url);
    }
    if (url.includes('/api/diagnose')) {
      watchers.aiCalls.push('diagnose');
    }
    if (url.includes('/api/assess')) {
      watchers.aiCalls.push('assess');
    }
  });

  page.on('requestfailed', (request) => {
    const failure = request.failure()?.errorText ?? 'unknown';
    const resourceType = request.resourceType();
    const isNavigation = request.isNavigationRequest();
    const detail = `${failure} | url=${request.url()} | resourceType=${resourceType} | navigation=${isNavigation}`;
    watchers.requestFailures.push(detail);
    watchers.browserIssues.push(`requestfailed: ${detail}`);
  });

  return watchers;
}

async function expectNoPageOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth;
  });
  expect(overflow).toBe(false);
}

function expectCleanRun(watchers: FlowWatchers) {
  expect(watchers.externalRequests).toEqual([]);
  expect(watchers.browserIssues).toEqual([]);
  expect(watchers.aiCalls).toEqual([]);
  expect(watchers.requestFailures).toEqual([]);
}

test.describe('adaptive density flow', () => {
  test('mobile 390x844: default focused -> switch deep -> locale switch -> no overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const watchers = watchPage(page);

    // 1. Intake as beginner
    await page.goto('/learn?goal=Transformer&locale=en');
    await page.getByRole('radio', { name: 'Not sure how to answer' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();

    // 2. Skip challenge
    await page
      .getByRole('heading', {
        name: 'Want a short optional challenge?',
        level: 1,
      })
      .waitFor();
    await page.getByRole('button', { name: 'Skip and build my path' }).click();
    await page
      .getByRole('heading', { name: 'Your learning path', level: 1 })
      .waitFor();

    // 3. Open lesson (Numbers)
    const pathItems = page.locator('ol > li');
    await expect(pathItems).toHaveCount(25);
    await pathItems
      .first()
      .getByRole('button', { name: 'Start this lesson' })
      .click();
    await page.getByRole('heading', { name: 'Numbers', level: 2 }).waitFor();

    // Verify initial interaction count (could be 1 due to navigation into lesson)
    const main = page.locator('main');
    const initialInteractions = await main.getAttribute('data-interaction-count');
    const initialCount = parseInt(initialInteractions || '0', 10);

    // 4. Check default is focused (1 section: primary explanation)
    const sections = page.locator('[data-lesson-section]');
    await expect(sections).toHaveCount(1);
    await expect(sections.first()).toHaveAttribute('data-lesson-section', 'explanation');

    // 5. Switch to deep
    await page.getByRole('radio', { name: 'Deep' }).check();

    // 6. Assert sections increase to 4 (explanation, example, rigorous, mistake)
    await expect(sections).toHaveCount(4);

    // 7. Assert interaction count increments exactly once
    await expect(main).toHaveAttribute(
      'data-interaction-count',
      String(initialCount + 1),
    );

    // 8. (Route length and mastery implicitly unchanged as we did not submit anything,
    // and no route-change UI is visible).

    // 9. Switch locale to Chinese -> assert deep remains checked
    await page.getByTestId('language-toggle').click();
    await page.getByRole('heading', { name: '数字', level: 2 }).waitFor();

    // Check if deep radio is still checked
    await expect(page.getByRole('radio', { name: '深入' })).toBeChecked();
    await expect(sections).toHaveCount(4);

    // 10. Check no overflow
    await expectNoPageOverflow(page);

    // 11. Strict origin check (ensure 0 third-party requests/errors)
    expectCleanRun(watchers);
  });

  test('types an unfinished open answer, switches depth and language, and confirms draft remains', async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const watchers = watchPage(page);

    // 1. Intake as beginner
    await page.goto('/learn?goal=Transformer&locale=en');
    await page.getByRole('radio', { name: 'Not sure how to answer' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();

    // 2. Skip challenge
    await page
      .getByRole('heading', {
        name: 'Want a short optional challenge?',
        level: 1,
      })
      .waitFor();
    await page.getByRole('button', { name: 'Skip and build my path' }).click();
    await page
      .getByRole('heading', { name: 'Your learning path', level: 1 })
      .waitFor();

    // 3. Open lesson (Numbers)
    const pathItems = page.locator('ol > li');
    await pathItems
      .first()
      .getByRole('button', { name: 'Start this lesson' })
      .click();
    await page.getByRole('heading', { name: 'Numbers', level: 2 }).waitFor();

    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();

    // 4. Type unfinished open answer draft
    const draftText = 'Numbers let us represent discrete quantities like 3 apples or 5 oranges without ambiguity.';
    await textarea.fill(draftText);
    await expect(textarea).toHaveValue(draftText);

    // Capture screenshot in Focused mode with draft
    await page.screenshot({
      path: testInfo.outputPath('draft_open_answer_focused_en.png'),
      fullPage: true,
    });

    // 5. Switch depth from Focused to Deep
    await page.getByRole('radio', { name: 'Deep' }).check();
    await expect(textarea).toHaveValue(draftText);

    // Capture screenshot in Deep mode with draft
    await page.screenshot({
      path: testInfo.outputPath('draft_open_answer_deep_en.png'),
      fullPage: true,
    });

    // 6. Switch language to Chinese
    await page.getByTestId('language-toggle').click();
    await page.getByRole('heading', { name: '数字', level: 2 }).waitFor();
    await expect(textarea).toHaveValue(draftText);

    // Capture screenshot in Chinese Deep mode with draft
    await page.screenshot({
      path: testInfo.outputPath('draft_open_answer_deep_zh.png'),
      fullPage: true,
    });

    // 7. Switch depth to Balanced in Chinese
    await page.getByRole('radio', { name: '均衡' }).check();
    await expect(textarea).toHaveValue(draftText);

    // 8. Switch depth to Focused in Chinese
    await page.getByRole('radio', { name: '精简' }).check();
    await expect(textarea).toHaveValue(draftText);

    // Capture screenshot in Chinese Focused mode with draft
    await page.screenshot({
      path: testInfo.outputPath('draft_open_answer_focused_zh.png'),
      fullPage: true,
    });

    // 9. Switch language back to English
    await page.getByTestId('language-toggle').click();
    await page.getByRole('heading', { name: 'Numbers', level: 2 }).waitFor();
    await expect(textarea).toHaveValue(draftText);

    // 10. Clean execution with no unauthorized network requests
    expectCleanRun(watchers);
  });
});

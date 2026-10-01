import { expect, test, type Page } from '@playwright/test';

const ALLOWED_ORIGIN = 'http://127.0.0.1:3000';

type FlowWatchers = {
  aiCalls: string[];
  externalRequests: string[];
  browserIssues: string[];
  requestFailures: string[];
};

/**
 * Exact, intentional console filters only:
 * - React DevTools promo (not an app error)
 * - Next.js Fast Refresh informational logs
 */
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

async function runCoreLearningFlow(
  page: Page,
  options: { checkOverflow?: boolean } = {},
): Promise<FlowWatchers> {
  const watchers = watchPage(page);
  const { checkOverflow = false } = options;

  await page.goto('/learn?goal=Transformer&locale=en');

  await page.getByRole('radio', { name: 'Not sure how to answer' }).check();
  await page.getByRole('button', { name: 'Continue' }).click();

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

  // checkpoint: 25-step route page
  if (checkOverflow) {
    const initialScrollHeight = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    expect(initialScrollHeight).toBeLessThan(1600);
    await expectNoPageOverflow(page);
  }

  // Exactly one visible "Start this lesson" primary button exists
  const startButtons = page.getByRole('button', { name: 'Start this lesson' });
  await expect(startButtons).toHaveCount(1);
  await expect(startButtons.first()).toBeVisible();

  // Graph detail contains no start button
  const graphDetail = page.locator('section[aria-labelledby="kg-detail-title"]');
  await expect(
    graphDetail.getByRole('button', { name: 'Start this lesson' }),
  ).toHaveCount(0);

  // All 25 items remain direct children of the semantic ordered list
  const pathItems = page.locator('ol#learning-path-list > li');
  await expect(pathItems).toHaveCount(25);
  await expect(pathItems.first()).toContainText('Numbers');
  await expect(pathItems.first()).toContainText('Up next');
  await expect(pathItems.first()).toContainText('Start here');
  await expect(pathItems.first()).toBeVisible();

  // 24 upcoming items are hidden initially
  for (let i = 1; i < 25; i++) {
    await expect(pathItems.nth(i)).toBeHidden();
  }

  // Collapsed preview content is visible
  await expect(page.getByText('Upcoming steps (24)')).toBeVisible();
  await expect(
    page.getByText('Next: Probability · Final goal: Transformer'),
  ).toBeVisible();

  // Expanding shows the locked items
  const showButton = page.getByRole('button', { name: 'Show all steps' });
  await expect(showButton).toHaveAttribute('aria-expanded', 'false');
  await showButton.click();

  const collapseButton = page.getByRole('button', { name: 'Collapse steps' });
  await expect(collapseButton).toHaveAttribute('aria-expanded', 'true');
  for (let i = 1; i < 25; i++) {
    await expect(pathItems.nth(i)).toBeVisible();
  }
  await expect(pathItems.last()).toContainText('Transformer');
  await expect(pathItems.last()).toContainText('25');

  // Collapsing hides them again
  await collapseButton.click();
  await expect(page.getByRole('button', { name: 'Show all steps' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  for (let i = 1; i < 25; i++) {
    await expect(pathItems.nth(i)).toBeHidden();
  }

  // Start the active lesson using the single primary CTA
  await startButtons.first().click();
  await page.getByRole('heading', { name: 'Numbers', level: 2 }).waitFor();

  // checkpoint: Numbers open-answer page
  if (checkOverflow) {
    await expectNoPageOverflow(page);
  }

  await expect(page.locator('textarea').first()).toBeVisible();
  await expect(
    page.getByRole('group', { name: 'Quick quiz' }),
  ).toHaveCount(0);

  await page.getByRole('button', { name: 'Use quick quiz instead' }).click();
  await expect(page.getByRole('group', { name: 'Quick quiz' })).toBeVisible();

  // checkpoint: Quick quiz expanded
  if (checkOverflow) {
    await expectNoPageOverflow(page);
  }

  await page
    .getByRole('radio', { name: 'The quantity of pencils in a backpack' })
    .check();
  await page.getByRole('button', { name: 'Submit answer' }).click();

  await page.getByText('Numbers mastered').waitFor();
  await expect(page.getByText('25 steps → 24 steps')).toBeVisible();
  await expect(page.getByText('Next: Probability')).toBeVisible();

  // checkpoint: route change summary 25→24
  if (checkOverflow) {
    await expectNoPageOverflow(page);
  }

  await page.getByTestId('language-toggle').click();
  await page.getByRole('heading', { name: '已掌握「数字」' }).waitFor();
  await expect(page.getByText('25 步 → 24 步')).toBeVisible();
  await expect(page.getByText('下一课：概率')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '已掌握「数字」' }),
  ).toBeVisible();

  await page.getByTestId('language-toggle').click();
  await page.getByText('Numbers mastered').waitFor();

  await page.getByRole('button', { name: 'Continue to next lesson' }).click();
  await page.getByRole('heading', { name: 'Probability', level: 2 }).waitFor();
  await expect(
    page.getByRole('heading', { name: 'Probability', level: 2 }),
  ).toBeVisible();

  // checkpoint: Probability lesson page
  if (checkOverflow) {
    await expectNoPageOverflow(page);
  }

  return watchers;
}

function expectCleanRun(watchers: FlowWatchers) {
  expect(watchers.externalRequests).toEqual([]);
  expect(watchers.browserIssues).toEqual([]);
  expect(watchers.aiCalls).toEqual([]);
  expect(watchers.requestFailures).toEqual([]);
}

test.describe('core learning flow', () => {
  test('desktop: diagnose skip → numbers quiz → mastery → probability', async ({
    page,
  }) => {
    const watchers = await runCoreLearningFlow(page, { checkOverflow: false });
    expectCleanRun(watchers);
  });

  test('mobile 390x844: same flow without page overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const watchers = await runCoreLearningFlow(page, { checkOverflow: true });
    expectCleanRun(watchers);
  });
});

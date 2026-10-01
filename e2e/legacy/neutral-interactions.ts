import { expect, test, type Page } from '@playwright/test';
import type { LearnerBeliefState } from '../../lib/domain/learner-belief';

const ALLOWED_ORIGIN = 'http://127.0.0.1:3000';
const SESSION_KEY = 'gibc_v2_session_transformer';
const ROUTE_ITEM = 'ol#learning-path-list > li';

type FlowWatchers = {
  aiCalls: string[];
  externalRequests: string[];
  browserIssues: string[];
  requestFailures: string[];
};

function isIgnorableConsoleMessage(type: string, text: string): boolean {
  if (type === 'warning' && text.includes('Download the React DevTools')) return true;
  if (type === 'warning' && text.includes('Fast Refresh')) return true;
  if (type === 'warning' && text.includes('[Fast Refresh]')) return true;
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
  const watchers: FlowWatchers = { aiCalls: [], externalRequests: [], browserIssues: [], requestFailures: [] };
  page.on('pageerror', (error) => watchers.browserIssues.push('pageerror: ' + error.message));
  page.on('console', (message) => {
    const type = message.type(); const text = message.text();
    if ((type === 'error' || type === 'warning') && !isIgnorableConsoleMessage(type, text)) {
      watchers.browserIssues.push(type + ': ' + text);
    }
  });
  page.on('request', (request) => {
    const url = request.url();
    if (!isAllowedRequestUrl(url)) {
      watchers.externalRequests.push(url);
    }
    if (url.includes('/api/diagnose')) watchers.aiCalls.push('diagnose');
    if (url.includes('/api/assess')) watchers.aiCalls.push('assess');
  });
  page.on('requestfailed', (request) => {
    watchers.requestFailures.push(request.url());
  });
  return watchers;
}

async function readStoredBelief(page: Page): Promise<LearnerBeliefState> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      throw new Error(`localStorage key missing: ${key}`);
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(`localStorage value is not JSON for key: ${key}`);
    }
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error(`localStorage JSON is not an object for key: ${key}`);
    }
    const session = parsed as { learnerBelief?: unknown };
    const belief = session.learnerBelief;
    if (typeof belief !== 'object' || belief === null) {
      throw new Error('session.learnerBelief missing or not an object');
    }
    const b = belief as Record<string, unknown>;
    const required = [
      'stage',
      'mastery',
      'conceptEvidence',
      'knowledgeEvidenceCount',
      'interactionCount',
      'stableLevel',
      'pendingLevelCount',
    ];
    for (const field of required) {
      if (!(field in b)) {
        throw new Error(`learnerBelief missing required field: ${field}`);
      }
    }
    if (!('pendingLevel' in b)) {
      throw new Error('learnerBelief missing required field: pendingLevel');
    }
    return belief as LearnerBeliefState;
  }, SESSION_KEY);
}

async function waitForStoredInteractionCount(
  page: Page,
  expected: number,
): Promise<LearnerBeliefState> {
  await expect
    .poll(async () => {
      const belief = await readStoredBelief(page);
      return belief.interactionCount;
    })
    .toBe(expected);
  return readStoredBelief(page);
}

function expectBeliefInvariantUnchanged(
  baseline: LearnerBeliefState,
  current: LearnerBeliefState,
  expectedInteractionCount: number,
): void {
  expect(current.interactionCount).toBe(expectedInteractionCount);
  expect(current.stage).toEqual(baseline.stage);
  expect(current.mastery).toEqual(baseline.mastery);
  expect(current.conceptEvidence).toEqual(baseline.conceptEvidence);
  expect(current.knowledgeEvidenceCount).toBe(baseline.knowledgeEvidenceCount);
  expect(current.stableLevel).toBe(baseline.stableLevel);
  expect(current.pendingLevel).toBe(baseline.pendingLevel);
  expect(current.pendingLevelCount).toBe(baseline.pendingLevelCount);
}

test('neutral user interactions do not change mastery', async ({ page }) => {
  const watchers = watchPage(page);

  await page.goto('/learn?goal=Transformer&locale=en');

  // Intake -> Route
  await page.getByRole('radio', { name: 'Not sure how to answer' }).check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('heading', { name: 'Want a short optional challenge?', level: 1 }).waitFor();
  await page.getByRole('button', { name: 'Skip and build my path' }).click();

  await page.getByRole('heading', { name: 'Your learning path', level: 1 }).waitFor();

  const getInteractionCount = async () => {
    const main = page.locator('main[data-interaction-count]');
    const countStr = await main.getAttribute('data-interaction-count');
    return parseInt(countStr || '0', 10);
  };

  const getRouteLength = async () => {
    return await page.locator(ROUTE_ITEM).count();
  };

  let count = await getInteractionCount();
  const initialRouteLength = await getRouteLength();

  // a. Locale toggle
  await page.getByRole('button', { name: 'Language' }).click();
  await expect(page.locator('main[data-interaction-count]')).toHaveAttribute('data-interaction-count', String(count + 1));
  count += 1;

  let currentRouteLength = await getRouteLength();
  expect(currentRouteLength).toBe(initialRouteLength);

  // Switch back to english
  await page.getByRole('button', { name: '语言' }).click();
  await expect(page.locator('main[data-interaction-count]')).toHaveAttribute('data-interaction-count', String(count + 1));
  count += 1;

  // b. Graph node selection
  await page.locator('button[aria-current="step"]').click();
  await expect(page.locator('main[data-interaction-count]')).toHaveAttribute('data-interaction-count', String(count + 1));
  count += 1;

  currentRouteLength = await getRouteLength();
  expect(currentRouteLength).toBe(initialRouteLength);

  // c. Route disclosure (expand / collapse upcoming steps)
  // Wait until the session snapshot is actually persisted before baseline.
  const baselineBelief = await waitForStoredInteractionCount(page, count);
  const baselineRouteLength = await getRouteLength();

  await page.getByRole('button', { name: 'Show all steps' }).click();
  const afterExpandBelief = await waitForStoredInteractionCount(page, baselineBelief.interactionCount + 1);
  expectBeliefInvariantUnchanged(baselineBelief, afterExpandBelief, baselineBelief.interactionCount + 1);
  expect(await getRouteLength()).toBe(baselineRouteLength);

  await page.getByRole('button', { name: 'Collapse steps' }).click();
  const afterCollapseBelief = await waitForStoredInteractionCount(page, baselineBelief.interactionCount + 2);
  expectBeliefInvariantUnchanged(baselineBelief, afterCollapseBelief, baselineBelief.interactionCount + 2);
  expect(await getRouteLength()).toBe(baselineRouteLength);

  count = baselineBelief.interactionCount + 2;

  // d. Navigation & Retry
  await page
    .locator(ROUTE_ITEM)
    .first()
    .getByRole('button', { name: 'Start this lesson' })
    .click();
  await expect(page.locator('main[data-interaction-count]')).toHaveAttribute(
    'data-interaction-count',
    String(count + 1),
  );
  count += 1;

  await page.getByRole('button', { name: 'Use quick quiz' }).click();
  await expect(page.locator('main[data-interaction-count]')).toHaveAttribute('data-interaction-count', String(count + 1));
  count += 1;

  await page.getByRole('group', { name: 'Quick quiz' }).getByRole('radio').nth(0).check();
  await page.getByRole('button', { name: 'Submit answer' }).click();
  await page.getByText('Not quite').waitFor();

  await page.getByRole('button', { name: 'Try again' }).click();

  await expect(page.locator('main[data-interaction-count]')).toHaveAttribute('data-interaction-count', String(count + 1));
  count += 1;

  await page.getByRole('group', { name: 'Quick quiz' }).getByRole('radio').nth(1).check();
  await page.getByRole('button', { name: 'Submit answer' }).click();

  await page.getByText('Correct!').waitFor();

  await page.getByRole('button', { name: 'View updated path' }).click();
  await expect(page.locator('main[data-interaction-count]')).toHaveAttribute('data-interaction-count', String(count + 1));
  count += 1;

  await page.getByRole('heading', { name: 'Your learning path', level: 1 }).waitFor();

  const finalRouteLength = await getRouteLength();
  expect(finalRouteLength).toBe(initialRouteLength);

  expect(watchers.aiCalls).toEqual([]);
  expect(watchers.externalRequests).toEqual([]);
  expect(watchers.browserIssues).toEqual([]);
  expect(watchers.requestFailures).toEqual([]);
});

import { expect, test, type Page } from '@playwright/test';

const ALLOWED_ORIGIN = 'http://127.0.0.1:3000';

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

test('mocked semantic diagnosis flow', async ({ page }) => {
  const watchers = watchPage(page);

  await page.route('**/api/diagnose', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        version: 1,
        gaps: [],
        evidence: [
          {
            conceptId: 'vector',
            score: 0.8,
            confidence: 0.8,
            reason: { en: 'User mentioned a quote.', zh: 'User mentioned a quote.' },
            quote: 'I know vector directions',
          }
        ],
        communicationStyle: 'plain',
        summary: { en: 'summary', zh: 'summary' }
      })
    });
  });

  await page.goto('/learn?goal=Transformer&locale=en');

  await page.getByRole('radio', { name: 'In my own words' }).check();
  await page.getByRole('textbox', { name: 'What do you already know? What confuses you?' }).fill('I know vector directions');
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('heading', { name: 'Want a short optional challenge?', level: 1 }).waitFor();

  await page.getByRole('button', { name: 'Skip and build my path' }).click();

  await page.getByRole('heading', { name: 'Your learning path', level: 1 }).waitFor();

  expect(watchers.aiCalls).toEqual(['diagnose']);

  const pathItems = page.locator('ol > li');
  await expect(pathItems).toHaveCount(25);

  await page.locator('[data-graph-node="vector"] button').click();

  await page.getByText(/Current evidence:/).waitFor();

  const text = await page.getByText(/Current evidence:/).textContent();
  const match = text?.match(/Current evidence:\s*(\d+)%/);
  expect(match).not.toBeNull();

  const score = parseInt(match![1], 10);
  expect(score).toBeGreaterThan(35);
  expect(score).toBeLessThan(70);

  expect(watchers.externalRequests).toEqual([]);
  expect(watchers.browserIssues).toEqual([]);
  expect(watchers.requestFailures).toEqual([]);
});

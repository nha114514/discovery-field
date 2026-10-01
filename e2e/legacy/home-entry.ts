import { test, expect } from '@playwright/test';

const ALLOWED_ORIGIN = 'http://127.0.0.1:3000';

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

test.describe('Homepage truthful demo entry', () => {
  test('stays light under a dark OS preference and keeps its responsive frame', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/?locale=en');
      await expect(page.getByRole('heading', { name: 'Understand Transformers from where you are.' })).toBeVisible();
      const frame = await page.evaluate(() => ({
        background: getComputedStyle(document.body).backgroundColor,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      }));
      expect(frame.background).toBe('rgb(255, 255, 255)');
      expect(frame.overflow).toBe(false);
      await page.getByRole('link', { name: /Discovery Field/ }).click();
      await expect(page).toHaveURL(/locale=en/);
    }
  });

  test('presents Transformer as live demo, marks future curricula non-interactive, and preserves input on locale toggle', async ({
    page,
  }) => {
    let diagnoseRequests = 0;
    let assessRequests = 0;
    const thirdPartyRequests: string[] = [];
    const requestFailures: string[] = [];
    const browserConsoleIssues: string[] = [];

    page.on('request', (req) => {
      const url = req.url();
      if (!isAllowedRequestUrl(url)) {
        thirdPartyRequests.push(url);
      }
      try {
        const parsed = new URL(url);
        if (parsed.pathname === '/api/diagnose') diagnoseRequests++;
        if (parsed.pathname === '/api/assess') assessRequests++;
      } catch {
        // Unparseable URLs already captured in thirdPartyRequests
      }
    });

    page.on('requestfailed', (req) => {
      const failure = req.failure()?.errorText ?? 'unknown';
      requestFailures.push(`${failure} | ${req.url()}`);
    });

    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type !== 'error' && type !== 'warning') {
        return;
      }
      if (isIgnorableConsoleMessage(type, text)) {
        return;
      }
      browserConsoleIssues.push(`[${type}] ${text}`);
    });

    page.on('pageerror', (err) => {
      browserConsoleIssues.push(`[pageerror] ${err.message}`);
    });

    // Mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });

    // 1. Visit homepage in English
    await page.goto('/?locale=en');

    // 2. English homepage shows Transformer as the only interactive demo goal
    await expect(
      page.getByRole('heading', { name: 'Available now', level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Coming soon', level: 2 }),
    ).toBeVisible();

    const transformerLink = page.getByRole('link', { name: /Transformer/ });
    await expect(transformerLink).toBeVisible();
    await expect(transformerLink).toHaveAttribute(
      'href',
      '/learn?goal=Transformer&locale=en',
    );
    await expect(page.getByText('Try the live demo')).toBeVisible();

    const demoSection = page.locator('section');
    await expect(demoSection.getByRole('link')).toHaveCount(1);
    await expect(demoSection.getByRole('button')).toHaveCount(0);

    // 3. Fourier Transform and TCP have no link/button semantics
    await expect(page.getByRole('link', { name: /Fourier/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Fourier/i })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /TCP/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /TCP/i })).toHaveCount(0);

    await expect(page.getByText('Fourier Transform')).toBeVisible();
    await expect(page.getByText('TCP')).toBeVisible();
    await expect(page.getByText('(Coming soon)')).toHaveCount(2);

    // 4. Clicking Transformer reaches the supported intake flow, not the unsupported page
    await transformerLink.click();
    await page.waitForURL('**/learn?goal=Transformer&locale=en');
    await expect(
      page.getByRole('heading', { name: 'Tell us where you are', level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText('This goal is not fully supported yet'),
    ).toHaveCount(0);

    // 5. Return home
    await page.goto('/?locale=en');

    // 6. Type into the goal field
    const goalInput = page.locator('input[name="goal"]');
    await expect(goalInput).toBeVisible();
    await goalInput.fill('Quantum Computing');

    // 7. Switch language to Chinese
    await page.getByTestId('language-toggle').click();

    // 8. Switching language preserves typed value, updates URL and html lang
    await expect(goalInput).toHaveValue('Quantum Computing');
    expect(page.url()).toContain('locale=zh');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');

    // 9. Chinese copy renders correctly
    await expect(
      page.getByRole('heading', { name: '现已支持', level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '即将支持', level: 2 }),
    ).toBeVisible();
    await expect(page.getByText('傅里叶变换')).toBeVisible();
    await expect(page.getByText('体验完整演示')).toBeVisible();
    await expect(page.getByText('(即将支持)')).toHaveCount(2);

    // 10. The Transformer URL carries the current locale (zh)
    const transformerLinkZh = page.getByRole('link', { name: /Transformer/ });
    await expect(transformerLinkZh).toBeVisible();
    await expect(transformerLinkZh).toHaveAttribute(
      'href',
      '/learn?goal=Transformer&locale=zh',
    );

    // Chinese non-interactive checks
    await expect(page.getByRole('link', { name: /傅里叶变换/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /傅里叶变换/ })).toHaveCount(0);

    // 11. Toggle back to English preserves the typed value as well
    await page.getByTestId('language-toggle').click();
    await expect(goalInput).toHaveValue('Quantum Computing');
    expect(page.url()).toContain('locale=en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // 12. Check 390x844 overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // 13. Visiting "/" without query parameters lands cleanly in default locale
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    const defaultTransformerLink = page.getByRole('link', { name: /Transformer/ });
    await expect(defaultTransformerLink).toBeVisible();
    await expect(defaultTransformerLink).toHaveAttribute(
      'href',
      '/learn?goal=Transformer&locale=zh',
    );
    await expect(
      page.getByRole('heading', { name: '现已支持', level: 2 }),
    ).toBeVisible();

    // 14. Network and browser hygiene assertions
    expect(diagnoseRequests).toBe(0);
    expect(assessRequests).toBe(0);
    expect(thirdPartyRequests).toEqual([]);
    expect(requestFailures).toEqual([]);
    expect(browserConsoleIssues).toEqual([]);
  });
});

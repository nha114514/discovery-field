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

test.describe('Adaptive Journey Explainer', () => {
  test('displays progressive disclosure correctly and retains state across locales', async ({ page }) => {
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
        // Unparseable URLs already pushed to thirdPartyRequests
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

    // 1. Beginner/no-AI intake
    await page.goto('/learn?goal=Transformer&locale=en');

    // Intake selection
    await page.getByRole('radio', { name: 'Not sure how to answer' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();

    await page
      .getByRole('heading', {
        name: 'Want a short optional challenge?',
        level: 1,
      })
      .waitFor();

    // 2. Skip optional challenge
    await page.getByRole('button', { name: 'Skip and build my path' }).click();

    // Wait for route page
    await page.getByRole('heading', { name: 'Your learning path', level: 1 }).waitFor();

    // 3. Confirm initial 25-step route
    const pathItems = page.locator('ol > li');
    await expect(pathItems).toHaveCount(25);

    // 4. Start Numbers
    await pathItems
      .first()
      .getByRole('button', { name: 'Start this lesson' })
      .click();
    await page.getByRole('heading', { name: 'Numbers', level: 2 }).waitFor();

    // 5. Use quick quiz
    await page.getByRole('button', { name: 'Use quick quiz instead' }).click();
    await expect(page.getByRole('group', { name: 'Quick quiz' })).toBeVisible();

    // 6. Answer correctly
    await page
      .getByRole('radio', { name: 'The quantity of pencils in a backpack' })
      .check();
    await page.getByRole('button', { name: 'Submit answer' }).click();

    // 7. Confirm 25 -> 24 summary
    await expect(page.getByRole('heading', { name: 'Numbers mastered' })).toBeVisible();
    await expect(page.getByText('25 steps → 24 steps')).toBeVisible();

    // 8. Details starts closed
    const details = page.locator('details');
    await expect(details).not.toHaveAttribute('open');

    // Expand “Why did my path change?”
    const summary = page.locator('summary', { hasText: 'Why did my path change?' });
    await expect(summary).toBeVisible();
    await summary.click();

    // 9. Confirm <details> has open attribute and representative English assertions are visible
    await expect(details).toHaveAttribute('open', '');

    const enEvidence = page.getByText('This quick-quiz answer counted as knowledge evidence.');
    await expect(enEvidence).toBeVisible();

    const enGraphPruned = page.getByText(
      'Numbers is mastered, so it was removed from your remaining learning route. It still stays visible in the full knowledge map.',
    );
    await expect(enGraphPruned).toBeVisible();

    const enNext = page.getByText(
      'Probability is now the next recommended concept whose prerequisites are ready.',
    );
    await expect(enNext).toBeVisible();

    const enStable = page.getByText('Your overall lesson detail stays First time seeing this');
    await expect(enStable).toBeVisible();

    const enNeutral = page.getByText(
      'Browsing, language switching, and ordinary clicks never count as knowledge evidence.',
    );
    await expect(enNeutral).toBeVisible();

    await expect(page.getByText('waiting for consistent evidence')).toHaveCount(0);
    await expect(page.getByText('your default lesson detail changed from')).toHaveCount(0);

    // 10. Switch to Chinese without page reload
    await page.getByTestId('language-toggle').click();

    // 11. Confirm <details> remains open and representative Chinese content is visible
    await expect(details).toHaveAttribute('open', '');

    const summaryZh = page.locator('summary', { hasText: '我的路线为什么改变了？' });
    await expect(summaryZh).toBeVisible();

    const zhEvidence = page.getByText('这次快捷测验的回答被记为知识证据。');
    await expect(zhEvidence).toBeVisible();

    const zhGraphPruned = page.getByText(
      '你已掌握「数字」，因此它已从剩余学习路线中移除，但仍会保留在完整知识图谱中。',
    );
    await expect(zhGraphPruned).toBeVisible();

    const zhNext = page.getByText('「概率」现在是前置条件已满足的下一项推荐内容。');
    await expect(zhNext).toBeVisible();

    const zhStable = page.getByText('你的整体课程详细程度仍为「第一次接触」');
    await expect(zhStable).toBeVisible();

    const zhNeutral = page.getByText('浏览内容、切换语言和普通点击都不会被当作知识证据。');
    await expect(zhNeutral).toBeVisible();

    await expect(page.getByText('系统注意到了可能的水平变化')).toHaveCount(0);
    await expect(page.getByText('你的默认课程详细程度已从')).toHaveCount(0);

    // Confirm route/mastery state is unchanged
    await expect(page.getByRole('heading', { name: '已掌握「数字」' })).toBeVisible();
    await expect(page.getByText('25 步 → 24 步')).toBeVisible();
    await expect(page.getByText('下一课：概率')).toBeVisible();

    // 12. Check 390x844 overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Final network & console assertions
    expect(diagnoseRequests).toBe(0);
    expect(assessRequests).toBe(0);
    expect(thirdPartyRequests).toEqual([]);
    expect(requestFailures).toEqual([]);
    expect(browserConsoleIssues).toEqual([]);
  });
});

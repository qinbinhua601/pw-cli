import { expect, test } from '@playwright/test';

import { DemoHomePage } from '../pages/demo-home-page';

test.describe('CLI basics', () => {
  test.describe.configure({ mode: 'parallel' });

  test('loads the demo and captures a full page baseline @smoke @visual', async ({ page }) => {
    const demo = new DemoHomePage(page);

    await test.step('open the local demo page', async () => {
      await demo.goto();
    });

    await test.step('capture the full page baseline', async () => {
      await expect(page).toHaveScreenshot('home-page.png', { fullPage: true });
    });
  });

  test('mocks api responses with page.route @smoke', async ({ page }) => {
    const demo = new DemoHomePage(page);

    await test.step('mock the dashboard api before navigation', async () => {
      await page.route('**/api/stats', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            title: 'Mock Dashboard',
            users: 2048,
            conversionRate: '17.6%',
          }),
        });
      });
    });

    await test.step('load the page and trigger the mocked request', async () => {
      await demo.goto();
      await demo.loadMockedStats();
    });

    await test.step('assert the mocked content is rendered', async () => {
      await expect(demo.statsPanel).toContainText('Mock Dashboard');
      await expect(demo.statsPanel).toContainText('用户数：2048');
    });
  });
});

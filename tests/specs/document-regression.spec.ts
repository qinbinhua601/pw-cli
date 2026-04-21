import { expect, test } from '@playwright/test';

import { docPages } from '../fixtures/doc-pages';

test.describe('Batch document regression', () => {
  test('iterates across document pages and captures snapshots @visual', async ({ page }) => {
    for (const [url, snapshot] of docPages) {
      await test.step(`capture ${url}`, async () => {
        await page.goto(url);
        await expect(page).toHaveScreenshot(snapshot, { fullPage: true });
      });
    }
  });
});

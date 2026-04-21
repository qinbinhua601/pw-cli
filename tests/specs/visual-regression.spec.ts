import { expect, test } from '@playwright/test';

import { DemoHomePage } from '../pages/demo-home-page';

test.describe('Visual regression', () => {
  test.describe.configure({ mode: 'parallel' });

  test('captures a component snapshot with explicit diff tolerance @visual', async ({ page }) => {
    const demo = new DemoHomePage(page);

    await test.step('open the demo page', async () => {
      await demo.goto();
    });

    await test.step('assert the hero card snapshot', async () => {
      await expect(demo.heroCard).toHaveScreenshot('hero-card.png', {
        maxDiffPixels: 100,
        threshold: 0.2,
      });
    });
  });

  test('captures the canvas rendering output @visual', async ({ page }) => {
    const demo = new DemoHomePage(page);

    await test.step('open the demo page', async () => {
      await demo.goto();
    });

    await test.step('assert the canvas snapshot', async () => {
      await expect(demo.canvas).toHaveScreenshot('chart-canvas.png');
    });
  });
});

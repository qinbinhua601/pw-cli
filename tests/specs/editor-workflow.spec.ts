import { expect, test } from '@playwright/test';

import { DemoHomePage } from '../pages/demo-home-page';

test.describe('Editor workflow', () => {
  test.describe.configure({ mode: 'serial' });

  test('validates text input and editor screenshot state @smoke @visual', async ({ page }) => {
    const demo = new DemoHomePage(page);

    await test.step('open the editor demo', async () => {
      await demo.goto();
    });

    await test.step('type content into the editable area', async () => {
      await demo.appendEditorText(' 这里补一条编辑器输入内容。');
    });

    await test.step('apply highlighting and verify text state', async () => {
      await demo.highlightEditorContent();
      await expect(demo.editor).toContainText('这里补一条编辑器输入内容。');
    });

    await test.step('capture the editor screenshot', async () => {
      await expect(demo.editor).toHaveScreenshot('editor-highlighted.png');
    });
  });
});

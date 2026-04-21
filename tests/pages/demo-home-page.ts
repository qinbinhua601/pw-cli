import { expect, type Locator, type Page } from '@playwright/test';

export class DemoHomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly heroCard: Locator;
  readonly statsPanel: Locator;
  readonly loadStatsButton: Locator;
  readonly toggleThemeButton: Locator;
  readonly canvas: Locator;
  readonly editor: Locator;
  readonly highlightButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', {
      name: '把命令行能力和视觉回归放在一个最小样例里。',
    });
    this.heroCard = page.getByTestId('hero-card');
    this.statsPanel = page.locator('#stats');
    this.loadStatsButton = page.getByRole('button', { name: '加载统计数据' });
    this.toggleThemeButton = page.getByRole('button', { name: '切换强调色' });
    this.canvas = page.locator('canvas');
    this.editor = page.locator('#editor');
    this.highlightButton = page.getByRole('button', { name: '高亮首段' });
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.heading).toBeVisible();
  }

  async loadMockedStats() {
    await this.loadStatsButton.click();
    await expect(this.statsPanel).not.toHaveText('等待加载接口数据...');
  }

  async appendEditorText(text: string) {
    await this.editor.click();
    await this.editor.press('End');
    await this.editor.type(text);
  }

  async highlightEditorContent() {
    await this.highlightButton.click();
  }
}

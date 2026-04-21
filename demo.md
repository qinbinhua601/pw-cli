# Playwright CLI 示例 Demo

这个 demo 按 `info.md` 里的内容，把 Playwright CLI 的主要能力拆成两部分：

1. CLI 命令怎么用
2. 对应能力在代码里怎么落地

项目文件：

- `demo-app/`：本地静态演示站点
- `tests/pages/demo-home-page.ts`：页面对象模型（POM）
- `tests/specs/*.spec.ts`：按能力拆分后的测试文件
- `tests/fixtures/doc-pages.ts`：批量页面回归数据
- `playwright.config.ts`：多浏览器、Trace、截图等配置
- `.github/workflows/playwright.yml`：CI 示例
- `package.json`：常用 CLI 命令脚本

## 0. 更接近真实项目的组织方式

这版 demo 已经不是把所有逻辑都堆在一个 spec 里，而是按真实项目常见结构拆开：

- `pages/` 放页面对象，集中管理 locator 和页面行为
- `specs/` 按功能域拆分用例
- `fixtures/` 放测试数据
- `.github/workflows/` 放 CI 配置

这样做的好处：

- selector 变更时只需要改一处
- 新增测试不需要重复写页面操作
- CI 可以直接复用，不用再手搭

## 1. 安装

```bash
npm install
npx playwright install
```

如果你要手动打开本地 demo 页面，可先启动静态服务：

```bash
npm run serve
```

## 2. 快速生成测试（录制脚本）

`info.md` 中对应命令：

```bash
npx playwright codegen https://example.com
```

在这个 demo 里，建议直接录制本地页面：

```bash
npm run codegen
```

注意：`codegen` 需要页面已经可访问。先在另一个终端执行：

```bash
npm run serve
```

等价命令：

```bash
npx playwright codegen http://127.0.0.1:4173
```

用途：

- 打开 demo 页面并录制操作
- 自动生成 JS/TS 测试代码
- 快速定位 selector

## 3. 运行测试

基础运行：

```bash
npm test
```

等价命令：

```bash
npx playwright test
```

这个 demo 默认会运行三个浏览器项目：

- `chromium`
- `firefox`
- `webkit`

对应配置见 `playwright.config.ts`。

如果你只想跑 Safari/WebKit 场景：

```bash
npm run test:safari
```

说明：

- 默认项目是本机已安装的 Chrome
- Safari 场景通过可选的 `webkit` 项目启用
- Playwright 不直接驱动本机 Safari，而是运行自己的 WebKit 构建
- 首次执行前通常需要 `npx playwright install webkit`

## 4. UI 模式调试

```bash
npm run test:ui
```

等价命令：

```bash
npx playwright test --ui
```

适合查看：

- 测试步骤
- DOM snapshot
- 每一步截图

## 5. Trace 调试

运行带 Trace 的测试：

```bash
npm run test:trace
```

等价命令：

```bash
npx playwright test --trace on
```

查看 Trace：

```bash
npx playwright show-trace path/to/trace.zip
```

或者：

```bash
npm run trace:show -- path/to/trace.zip
```

本 demo 的配置里同时保留失败用例的 Trace：

```ts
use: {
  trace: 'retain-on-failure',
}
```

你可以在 `test-results/` 目录找到生成的 zip 文件，然后用 `show-trace` 打开。

## 6. 网络/接口 Mock

`info.md` 中提到：

```ts
await page.route('/api/**', route => {
  route.fulfill({ json: mockData })
})
```

本 demo 对应示例在：

- `tests/specs/cli-basics.spec.ts`
- 用例名：`mocks api responses with page.route`

核心代码：

```ts
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
```

这会拦截页面里的 `/api/stats` 请求，直接返回 mock 数据，适合前端接口隔离测试。

## 7. 基础截图对比

`info.md` 中提到：

```ts
await expect(page).toHaveScreenshot();
```

本 demo 对应：

```ts
await expect(page).toHaveScreenshot('home-page.png', { fullPage: true });
```

位置：

- `tests/specs/cli-basics.spec.ts`
- 用例名：`loads the demo and captures a full page baseline`

首次生成基准图：

```bash
npm run test:update
```

等价命令：

```bash
npx playwright test --update-snapshots
```

之后直接运行：

```bash
npm test
```

## 8. 局部截图

`info.md` 中提到：

```ts
await expect(page.locator('.card')).toHaveScreenshot();
```

本 demo 对应：

```ts
await expect(page.getByTestId('hero-card')).toHaveScreenshot('hero-card.png', {
  maxDiffPixels: 100,
  threshold: 0.2,
});
```

位置：

- `tests/specs/visual-regression.spec.ts`
- 用例名：`captures a component snapshot with explicit diff tolerance`

为什么这样写：

- 组件级截图比整页更稳定
- 同时演示了 `maxDiffPixels` 和 `threshold` 的高级配置

## 9. Canvas 渲染回归

`info.md` 中提到：

```ts
await expect(page.locator('canvas')).toHaveScreenshot();
```

本 demo 对应：

```ts
await expect(page.locator('canvas')).toHaveScreenshot('chart-canvas.png');
```

位置：

- `tests/specs/visual-regression.spec.ts`
- 用例名：`captures the canvas rendering output`

适合检查：

- 图形位置
- 样式变化
- 渲染是否错位

## 10. 编辑器交互验证

`info.md` 中提到编辑器场景，比如 ProseMirror 一类富文本编辑器。

本 demo 在页面中提供了一个 `contenteditable` 编辑区域，对应测试：

```ts
const editor = page.locator('#editor');
await editor.click();
await editor.press('End');
await editor.type(' 这里补一条编辑器输入内容。');
await page.getByRole('button', { name: '高亮首段' }).click();
await expect(editor).toContainText('这里补一条编辑器输入内容。');
await expect(editor).toHaveScreenshot('editor-highlighted.png');
```

位置：

- `tests/specs/editor-workflow.spec.ts`
- 用例名：`validates text input and editor screenshot state`

这个例子同时演示：

- 输入行为
- DOM 文本断言
- 视觉截图断言

## 11. 浏览器兼容测试

`info.md` 中提到：

```bash
npx playwright test --project=webkit
```

本 demo 已在 `playwright.config.ts` 中启用：

- `chromium`
- `firefox`
- `webkit`

所以你可以直接执行：

```bash
npx playwright test --project=webkit
```

来模拟 Safari / WebKit 场景。

## 12. 批量页面回归

`info.md` 中提到文档系统批量截图对比的场景。

本 demo 在 `demo-app/docs/` 下放了 3 个独立文档页面，并通过 `tests/fixtures/doc-pages.ts` 管理测试数据，在测试中循环执行：

```ts
const pages = [
  ['/docs/doc-1.html', 'doc-1.png'],
  ['/docs/doc-2.html', 'doc-2.png'],
  ['/docs/doc-3.html', 'doc-3.png'],
] as const;

for (const [url, snapshot] of pages) {
  await page.goto(url);
  await expect(page).toHaveScreenshot(snapshot, { fullPage: true });
}
```

位置：

- `tests/specs/document-regression.spec.ts`
- 用例名：`iterates across document pages and captures snapshots`

你可以按这个模式继续扩展成几十页、几百页的页面回归任务。

## 13. Snapshot 目录和 diff 结果

第一次运行 `--update-snapshots` 后，Playwright 会在测试文件旁边生成 snapshot 目录，例如：

```txt
tests/
  specs/
    visual-regression.spec.ts
  specs/visual-regression.spec.ts-snapshots/
    hero-card-chromium-darwin.png
```

如果后续截图有差异，测试失败时会在 `test-results/` 里看到实际图、期望图和 diff 图。

## 14. 建议的体验顺序

如果你想完整体验一遍 `info.md` 里的所有内容，推荐按下面顺序：

1. `npm install`
2. `npx playwright install`
3. `npm run test:update`
4. `npm test`
5. `npm run test:ui`
6. `npm run test:trace`
7. `npm run codegen`
8. `npx playwright test --project=webkit`

## 16. CI 用法

仓库已经带了一份 GitHub Actions 配置：

- `.github/workflows/playwright.yml`

它会做这些事：

- `npm ci`
- `npx playwright install --with-deps`
- `npx playwright test`
- 上传 `playwright-report` 和 `test-results`

如果你把这个 demo 推到 GitHub，这份 workflow 可以直接作为最小 CI 起点。

## 17. POM 和分层示例

页面对象示例在：

- `tests/pages/demo-home-page.ts`

它把这些逻辑收口了：

- 首页打开
- 主要 locator
- 加载 mock 数据
- 编辑器输入
- 编辑器高亮

这样 spec 可以只关心断言，不关心页面细节。

## 18. 这份 demo 覆盖了什么

已覆盖 `info.md` 提到的全部核心用法：

- `codegen`
- `test`
- `test --ui`
- `test --trace on`
- `show-trace`
- `page.route()` 接口 Mock
- `toHaveScreenshot()` 全页截图
- `locator.toHaveScreenshot()` 局部截图
- `--update-snapshots`
- `maxDiffPixels` / `threshold`
- `canvas` 回归
- 编辑器交互验证
- `--project=webkit`
- 批量页面截图回归

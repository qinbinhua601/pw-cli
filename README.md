# Playwright CLI Demo

一个用于演示 Playwright CLI 常见能力的最小仓库，包含：

- 本地静态站点 `demo-app/`
- 页面对象模型（POM）
- 基础用例、接口 Mock、视觉回归、编辑器交互
- Trace、UI 模式、HTML report

仓库主要面向两个目标：

- 快速体验 Playwright CLI 的常用命令
- 作为一个可直接改造的示例项目

## 环境要求

- Node.js 18+
- npm
- 首次运行前安装 Playwright 浏览器

## 安装

```bash
npm install
npx playwright install
```

如果你要运行可选的 WebKit 项目，第一次通常还需要：

```bash
npx playwright install webkit
```

## 快速开始

先生成一次截图基线，再执行全部测试：

```bash
npm run test:update
npm test
```

这个仓库的 `playwright.config.ts` 已经配置了 `webServer`，跑测试时会自动启动本地站点：

- 地址：`http://127.0.0.1:4173`
- 静态目录：`demo-app/`

所以大部分情况下不需要手动先执行 `npm run serve`。

## 常用命令

```bash
npm test
npm run test:smoke
npm run test:visual
npm run test:safari
npm run test:ui
npm run test:trace
npm run test:update
npm run codegen
npm run report
```

对应含义：

- `npm test`：运行全部测试
- `npm run test:smoke`：只跑 `@smoke`
- `npm run test:visual`：只跑 `@visual`
- `npm run test:safari`：启用可选的 `webkit` 项目
- `npm run test:ui`：打开 Playwright UI 模式
- `npm run test:trace`：为本次运行强制开启 Trace
- `npm run test:update`：更新截图基线
- `npm run codegen`：打开 codegen 录制本地页面
- `npm run report`：打开最近一次 HTML 报告

## 仓库怎么用

### 1. 运行全部测试

```bash
npm test
```

等价于：

```bash
npx playwright test
```

默认项目是 `chrome`。配置见 [playwright.config.ts](./playwright.config.ts)。

### 2. 按 tag 运行

```bash
npm run test:smoke
npm run test:visual
```

或者直接使用：

```bash
npx playwright test --grep @smoke
npx playwright test --grep @visual
```

### 3. 跑单个测试文件

```bash
npx playwright test tests/specs/visual-regression.spec.ts
```

### 4. 跑单个 case

例如只跑视觉回归里带 diff 容忍度的那个 case：

```bash
npx playwright test tests/specs/visual-regression.spec.ts \
  --grep "explicit diff tolerance" \
  --project=chrome
```

### 5. Headed 方式运行

如果你想看到真实浏览器窗口：

```bash
npx playwright test tests/specs/visual-regression.spec.ts \
  --grep "explicit diff tolerance" \
  --project=chrome \
  --headed
```

如果你想边看边调试：

```bash
npx playwright test tests/specs/visual-regression.spec.ts \
  --grep "explicit diff tolerance" \
  --project=chrome \
  --headed \
  --debug
```

注意：

- `headed` 适合观察执行过程
- 视觉回归的截图基线通常应固定在同一种运行环境里生成
- 如果基线是在 `headless` 下生成，`headed` 下可能因为字体渲染、抗锯齿或合成差异而失败

### 6. UI 模式调试

```bash
npm run test:ui
```

适合查看：

- 用例列表
- `test.step()` 分步执行
- DOM snapshot
- 每一步截图

### 7. Trace 调试

运行：

```bash
npm run test:trace
```

查看 trace：

```bash
npx playwright show-trace path/to/trace.zip
```

也可以直接打开最近一次报告：

```bash
npm run report
```

默认配置里：

- `trace: 'retain-on-failure'`
- `screenshot: 'only-on-failure'`
- `video: 'retain-on-failure'`

所以失败用例通常会在 `test-results/` 下留下 trace、截图和视频。

### 8. Codegen 录制

```bash
npm run codegen
```

等价于：

```bash
npx playwright codegen http://127.0.0.1:4173
```

适合：

- 快速录制操作
- 生成初始测试代码
- 辅助定位 selector

如果你单独运行 `codegen`，建议先在另一个终端启动站点：

```bash
npm run serve
```

## 视觉回归怎么用

### 第一次生成基线

```bash
npm run test:update
```

这会执行：

```bash
npx playwright test --update-snapshots
```

### 后续校验差异

```bash
npm test
```

或者只跑视觉相关用例：

```bash
npm run test:visual
```

### 当前仓库里有哪些截图对比 case

- `tests/specs/cli-basics.spec.ts`
  - `loads the demo and captures a full page baseline @smoke @visual`
- `tests/specs/visual-regression.spec.ts`
  - `captures a component snapshot with explicit diff tolerance @visual`
  - `captures the canvas rendering output @visual`
- `tests/specs/editor-workflow.spec.ts`
  - `validates text input and editor screenshot state @smoke @visual`
- `tests/specs/document-regression.spec.ts`
  - `iterates across document pages and captures snapshots @visual`

其中最直接演示截图 diff 容忍度的是：

- `captures a component snapshot with explicit diff tolerance @visual`

它使用了：

```ts
await expect(demo.heroCard).toHaveScreenshot('hero-card.png', {
  maxDiffPixels: 100,
  threshold: 0.2,
});
```

### 基线文件在哪里

截图基线在测试文件旁边的 `*-snapshots/` 目录里。

例如：

```txt
tests/specs/visual-regression.spec.ts-snapshots/
```

这个路径由 [playwright.config.ts](./playwright.config.ts) 中的：

```ts
snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}'
```

决定。

### 差异图在哪里

测试失败后，差异产物会出现在：

```txt
test-results/
```

通常会包含：

- `expected`：基线图
- `actual`：本次运行截图
- `diff`：高亮差异图

如果想更直观地看差异，直接执行：

```bash
npm run report
```

然后在 HTML report 里打开失败用例查看 `Expected / Actual / Diff`。

## 测试结构

```txt
demo-app/
  index.html
  docs/
tests/
  fixtures/
  pages/
  specs/
playwright.config.ts
package.json
demo.md
info.md
```

主要文件说明：

- `demo-app/`：被测试的本地静态页面
- `tests/pages/demo-home-page.ts`：POM，集中管理 locator 和页面行为
- `tests/specs/cli-basics.spec.ts`：基础页面流和接口 Mock
- `tests/specs/visual-regression.spec.ts`：组件截图与 Canvas 截图
- `tests/specs/editor-workflow.spec.ts`：编辑器交互和截图
- `tests/specs/document-regression.spec.ts`：批量文档页面回归
- `tests/fixtures/doc-pages.ts`：批量页面列表

## 浏览器项目说明

当前配置默认包含：

- `chrome`

当环境变量 `PW_INCLUDE_WEBKIT=1` 时，额外启用：

- `webkit`

说明：

- `chrome` 使用本机已安装的 Google Chrome
- `webkit` 是 Playwright 自带的 WebKit 构建，不是直接驱动本机 Safari

## CI

GitHub Actions 示例见：

- `.github/workflows/playwright.yml`

典型流程：

1. `npm ci`
2. `npx playwright install --with-deps`
3. `npx playwright test`
4. 上传 `playwright-report` 和 `test-results`

## 参考文档

- [demo.md](./demo.md)：本仓库每个示例的详细对应说明
- [info.md](./info.md)：原始能力说明

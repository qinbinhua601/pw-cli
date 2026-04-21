import { defineConfig, devices } from '@playwright/test';

const projects = [
  {
    name: 'chrome',
    use: {
      ...devices['Desktop Chrome'],
      channel: 'chrome',
    },
  },
];

if (process.env.PW_INCLUDE_WEBKIT === '1') {
  projects.push({
    name: 'webkit',
    use: {
      ...devices['Desktop Safari'],
    },
  });
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}',
  webServer: {
    command: 'python3 -m http.server 4173 --directory demo-app',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
  },
  projects,
});

import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './tests',

    /* 并行运行测试 */
    fullyParallel: true,

    /* 失败时重试次数 */
    retries: process.env.CI ? 2 : 0,

    /* 并行工作进程数 */
    workers: process.env.CI ? 1 : undefined,

    /* 报告器配置 */
    reporter: [
        ['html', { outputFolder: '../reports/playwright-report' }],
        ['json', { outputFile: '../reports/json/playwright-results.json' }],
        ['junit', { outputFile: '../reports/junit/playwright-results.xml' }],
        process.env.CI ? ['github'] : ['list'],
    ],

    /* 全局设置 */
    use: {
        /* 基础 URL */
        baseURL: process.env.BASE_URL || 'http://localhost:3000',

        /* 在失败时收集追踪信息 */
        trace: 'on-first-retry',

        /* 截图配置 */
        screenshot: 'only-on-failure',

        /* 视频录制 */
        video: 'retain-on-failure',

        /* 忽略 HTTPS 错误 */
        ignoreHTTPSErrors: true,

        /* 默认超时 */
        actionTimeout: 30000,
        navigationTimeout: 30000,
    },

    /* 项目配置 - 不同的浏览器和环境 */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },

        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },

        /* 移动端测试 */
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },

        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },

        /* 品牌浏览器 */
        {
            name: 'Microsoft Edge',
            use: { ...devices['Desktop Edge'], channel: 'msedge' },
        },

        {
            name: 'Google Chrome',
            use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        },
    ],

    /* 本地开发服务器配置 */
    webServer: [
        {
            command: 'pnpm --filter blog dev',
            port: 3000,
            reuseExistingServer: !process.env.CI,
            env: {
                NODE_ENV: 'test',
            },
        },
        {
            command: 'pnpm --filter server dev',
            port: 3001,
            reuseExistingServer: !process.env.CI,
            env: {
                NODE_ENV: 'test',
                DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://test_user:test_password@localhost:5432/test_db',
            },
        },
        {
            command: 'pnpm --filter lowcode dev',
            port: 3002,
            reuseExistingServer: !process.env.CI,
            env: {
                NODE_ENV: 'test',
            },
        },
    ],

    /* 全局设置和拆卸 */
    globalSetup: require.resolve('./global-setup'),
    globalTeardown: require.resolve('./global-teardown'),

    /* 输出目录 */
    outputDir: '../reports/playwright-artifacts',

    /* 测试超时 */
    timeout: 60000,
    expect: {
        timeout: 10000,
    },

    /* 其他配置 */
    forbidOnly: !!process.env.CI,

    /* 更新快照 */
    updateSnapshots: 'missing',
});

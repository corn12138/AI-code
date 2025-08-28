import { defineConfig, devices } from '@playwright/test';

/**
 * 增强版 Playwright 配置
 * 支持更好的稳定性、性能和调试功能
 */
export default defineConfig({
    testDir: './tests',
    
    /* 全局设置 */
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 3 : 1, // CI环境增加重试次数
    workers: process.env.CI ? 2 : undefined, // CI环境限制并发数
    
    /* 超时设置 */
    timeout: 60000, // 单个测试超时
    expect: {
        timeout: 15000, // 断言超时
    },
    
    /* 报告器配置 */
    reporter: [
        ['html', { 
            outputFolder: '../reports/playwright-report',
            open: 'never'
        }],
        ['json', { 
            outputFile: '../reports/json/playwright-results.json' 
        }],
        ['junit', { 
            outputFile: '../reports/junit/playwright-results.xml' 
        }],
        ['allure-playwright', {
            outputFolder: '../reports/allure-results'
        }],
        process.env.CI ? ['github'] : ['list'],
    ],
    
    /* 全局测试设置 */
    use: {
        /* 基础URL */
        baseURL: process
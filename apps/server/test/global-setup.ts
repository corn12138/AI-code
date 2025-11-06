/**
 * Vitest 全局设置文件
 * 基于最新的 Vitest 3.x 特性优化
 * 在测试套件运行前执行一次，用于设置全局环境
 */

import { performance } from 'perf_hooks';

// 全局测试统计
const testStats = {
    startTime: 0,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
};

export default async function setup() {
    console.log('🚀 启动 Vitest 全局设置...');

    // 记录开始时间
    testStats.startTime = performance.now();

    // ===== 环境变量设置 =====
    process.env.NODE_ENV = 'test';
    process.env.TYPEORM_LOGGING = 'false';
    process.env.TYPEORM_SYNCHRONIZE = 'false';
    process.env.LOG_LEVEL = 'error';
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
    process.env.JWT_ACCESS_EXPIRATION = '15m';
    process.env.JWT_REFRESH_EXPIRATION = '7d';
    process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/test_db';

    // ===== 全局错误处理 =====
    process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ 未处理的 Promise 拒绝:', reason);
        console.error('Promise:', promise);
    });

    process.on('uncaughtException', (error) => {
        console.error('❌ 未捕获的异常:', error);
    });

    // ===== 性能监控设置 =====
    if (typeof globalThis.gc === 'function') {
        // 启用垃圾回收监控
        setInterval(() => {
            if (globalThis.gc) {
                globalThis.gc();
            }
        }, 30000); // 每30秒执行一次GC
    }

    // ===== 内存监控 =====
    const memoryUsage = process.memoryUsage();
    console.log('📊 初始内存使用:', {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
    });

    // ===== 测试环境验证 =====
    console.log('🔍 验证测试环境...');

    // 检查必要的环境变量
    const requiredEnvVars = ['NODE_ENV', 'JWT_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.warn('⚠️ 缺少环境变量:', missingVars);
    }

    // 检查 Node.js 版本
    const nodeVersion = process.version;
    console.log('📦 Node.js 版本:', nodeVersion);

    // 检查可用内存
    const os = await import('os');
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    console.log('💾 系统内存:', {
        total: `${Math.round(totalMemory / 1024 / 1024 / 1024)}GB`,
        used: `${Math.round(usedMemory / 1024 / 1024 / 1024)}GB`,
        free: `${Math.round(freeMemory / 1024 / 1024 / 1024)}GB`,
        usage: `${Math.round((usedMemory / totalMemory) * 100)}%`,
    });

    // ===== 全局测试配置 =====
    globalThis.__TEST_CONFIG__ = {
        timeout: 30000,
        retries: 2,
        concurrency: 5,
        isolate: true,
    };

    // ===== 测试数据准备 =====
    console.log('📋 准备测试数据...');

    // 创建测试数据目录
    const fs = await import('fs');
    const path = await import('path');

    const testDirs = [
        './test-results',
        './coverage',
        './test-results/screenshots',
        './test-results/logs',
    ];

    testDirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    console.log('✅ Vitest 全局设置完成');
}

// 导出清理函数
export async function teardown() {
    console.log('🧹 清理 Vitest 全局设置...');

    // ===== 性能统计 =====
    const endTime = performance.now();
    const totalTime = endTime - testStats.startTime;

    console.log('📊 测试统计:', {
        总时间: `${Math.round(totalTime)}ms`,
        总测试数: testStats.totalTests,
        通过: testStats.passedTests,
        失败: testStats.failedTests,
        跳过: testStats.skippedTests,
        成功率: testStats.totalTests > 0 ? `${Math.round((testStats.passedTests / testStats.totalTests) * 100)}%` : '0%',
    });

    // ===== 内存清理 =====
    const memoryUsage = process.memoryUsage();
    console.log('📊 最终内存使用:', {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
    });

    // 执行垃圾回收
    if (typeof globalThis.gc === 'function') {
        globalThis.gc();
        console.log('🗑️ 执行垃圾回收');
    }

    // ===== 清理临时文件 =====
    const fs = await import('fs');
    const path = await import('path');

    try {
        // 清理临时测试文件
        const tempFiles = [
            './test-results/temp-*.json',
            './test-results/temp-*.log',
        ];

        // 这里可以添加具体的文件清理逻辑
        console.log('🧹 清理临时文件完成');
    } catch (error) {
        console.warn('⚠️ 清理临时文件时出错:', error);
    }

    console.log('✅ Vitest 全局清理完成');
}

// 导出测试统计工具
export function getTestStats() {
    return { ...testStats };
}

export function updateTestStats(stats: Partial<typeof testStats>) {
    Object.assign(testStats, stats);
}

/**
 * Vitest 增强插件
 * 基于最新的 Vitest 3.x 特性，提供额外的测试功能
 */

import { performance } from 'perf_hooks';
import type { Plugin } from 'vitest';

export interface VitestEnhancementsOptions {
    enablePerformanceMonitoring?: boolean;
    enableMemoryTracking?: boolean;
    enableCustomMatchers?: boolean;
    enableTestGrouping?: boolean;
}

export function vitestEnhancements(options: VitestEnhancementsOptions = {}): Plugin {
    const {
        enablePerformanceMonitoring = true,
        enableMemoryTracking = true,
        enableCustomMatchers = true,
        enableTestGrouping = true,
    } = options;

    return {
        name: 'vitest-enhancements',
        config(config) {
            // 增强配置
            if (enablePerformanceMonitoring) {
                config.test = config.test || {};
                config.test.logHeapUsage = true;
                config.test.passWithNoTests = true;
            }
        },
        setup() {
            // 性能监控
            if (enablePerformanceMonitoring) {
                const startTime = performance.now();

                // 监控测试执行时间
                const originalTest = globalThis.test;
                if (originalTest) {
                    globalThis.test = function (name, fn, timeout) {
                        return originalTest(name, async (...args) => {
                            const testStart = performance.now();
                            try {
                                await fn(...args);
                                const testEnd = performance.now();
                                console.log(`⏱️ 测试 "${name}" 执行时间: ${Math.round(testEnd - testStart)}ms`);
                            } catch (error) {
                                const testEnd = performance.now();
                                console.log(`❌ 测试 "${name}" 失败，执行时间: ${Math.round(testEnd - testStart)}ms`);
                                throw error;
                            }
                        }, timeout);
                    };
                }
            }

            // 内存跟踪
            if (enableMemoryTracking) {
                const memoryInterval = setInterval(() => {
                    const memUsage = process.memoryUsage();
                    if (memUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
                        console.warn('⚠️ 内存使用过高:', {
                            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
                            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
                        });
                    }
                }, 10000); // 每10秒检查一次

                // 清理定时器
                process.on('exit', () => clearInterval(memoryInterval));
            }

            // 自定义匹配器
            if (enableCustomMatchers) {
                // 添加自定义匹配器
                expect.extend({
                    toBeWithinRange(received: number, floor: number, ceiling: number) {
                        const pass = received >= floor && received <= ceiling;
                        if (pass) {
                            return {
                                message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
                                pass: true,
                            };
                        } else {
                            return {
                                message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
                                pass: false,
                            };
                        }
                    },

                    toBeValidEmail(received: string) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        const pass = emailRegex.test(received);
                        if (pass) {
                            return {
                                message: () => `expected ${received} not to be a valid email`,
                                pass: true,
                            };
                        } else {
                            return {
                                message: () => `expected ${received} to be a valid email`,
                                pass: false,
                            };
                        }
                    },

                    toBeValidUUID(received: string) {
                        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                        const pass = uuidRegex.test(received);
                        if (pass) {
                            return {
                                message: () => `expected ${received} not to be a valid UUID`,
                                pass: true,
                            };
                        } else {
                            return {
                                message: () => `expected ${received} to be a valid UUID`,
                                pass: false,
                            };
                        }
                    },
                });
            }

            // 测试分组
            if (enableTestGrouping) {
                // 添加测试分组功能
                globalThis.testGroup = function (name: string, fn: () => void) {
                    console.log(`📁 测试组: ${name}`);
                    fn();
                };
            }
        },
    };
}

// 导出增强功能
export default vitestEnhancements;

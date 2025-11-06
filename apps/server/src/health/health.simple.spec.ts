import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HealthController } from './health.controller';

describe('HealthController Simple Tests', () => {
    let controller: HealthController;
    let mockHealthService: any;

    beforeEach(() => {
        // 创建 mock 服务
        mockHealthService = {
            getDatabaseStatus: vi.fn(),
            checkDatabaseHealth: vi.fn(),
        };

        // 直接实例化控制器，传入 mock 服务
        controller = new HealthController(mockHealthService);
    });

    describe('check', () => {
        it('应该返回基本健康状态', async () => {
            const mockDbStatus = { status: 'healthy' };
            mockHealthService.getDatabaseStatus.mockResolvedValue(mockDbStatus);

            const result = await controller.check();

            expect(mockHealthService.getDatabaseStatus).toHaveBeenCalled();
            expect(result).toHaveProperty('status', 'ok');
            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('uptime');
            expect(result).toHaveProperty('database', mockDbStatus);
            expect(result).toHaveProperty('memory');
        });

        it('应该返回正确的内存信息格式', async () => {
            const mockDbStatus = { status: 'healthy' };
            mockHealthService.getDatabaseStatus.mockResolvedValue(mockDbStatus);

            const result = await controller.check();

            expect(result.memory).toHaveProperty('rss');
            expect(result.memory).toHaveProperty('heapTotal');
            expect(result.memory).toHaveProperty('heapUsed');
            expect(result.memory.rss).toMatch(/\d+MB/);
            expect(result.memory.heapTotal).toMatch(/\d+MB/);
            expect(result.memory.heapUsed).toMatch(/\d+MB/);
        });

        it('应该返回正确的运行时间格式', async () => {
            const mockDbStatus = { status: 'healthy' };
            mockHealthService.getDatabaseStatus.mockResolvedValue(mockDbStatus);

            const result = await controller.check();

            expect(result.uptime).toMatch(/\d+m \d+s/);
        });

        it('应该处理数据库服务错误', async () => {
            const error = new Error('Database connection failed');
            mockHealthService.getDatabaseStatus.mockRejectedValue(error);

            await expect(controller.check()).rejects.toThrow(error);
        });
    });

    describe('checkDb', () => {
        it('应该返回健康的数据库状态', async () => {
            mockHealthService.checkDatabaseHealth.mockResolvedValue(true);

            const result = await controller.checkDb();

            expect(mockHealthService.checkDatabaseHealth).toHaveBeenCalled();
            expect(result).toHaveProperty('database', 'healthy');
            expect(result).toHaveProperty('timestamp');
        });

        it('应该返回不健康的数据库状态', async () => {
            mockHealthService.checkDatabaseHealth.mockResolvedValue(false);

            const result = await controller.checkDb();

            expect(result).toHaveProperty('database', 'unhealthy');
            expect(result).toHaveProperty('timestamp');
        });

        it('应该处理数据库检查错误', async () => {
            const error = new Error('Database check failed');
            mockHealthService.checkDatabaseHealth.mockRejectedValue(error);

            await expect(controller.checkDb()).rejects.toThrow(error);
        });

        it('时间戳应该是有效的 ISO 字符串', async () => {
            mockHealthService.checkDatabaseHealth.mockResolvedValue(true);

            const result = await controller.checkDb();

            expect(() => new Date(result.timestamp)).not.toThrow();
            expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
        });
    });

    describe('响应格式验证', () => {
        it('健康检查响应应该包含所有必要字段', async () => {
            const mockDbStatus = { status: 'healthy', connections: 5 };
            mockHealthService.getDatabaseStatus.mockResolvedValue(mockDbStatus);

            const result = await controller.check();

            // 验证基本字段
            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('uptime');
            expect(result).toHaveProperty('database');
            expect(result).toHaveProperty('memory');

            // 验证字段类型
            expect(typeof result.status).toBe('string');
            expect(typeof result.timestamp).toBe('string');
            expect(typeof result.uptime).toBe('string');
            expect(typeof result.database).toBe('object');
            expect(typeof result.memory).toBe('object');

            // 验证内存字段
            expect(result.memory).toHaveProperty('rss');
            expect(result.memory).toHaveProperty('heapTotal');
            expect(result.memory).toHaveProperty('heapUsed');
        });

        it('数据库检查响应应该包含必要字段', async () => {
            mockHealthService.checkDatabaseHealth.mockResolvedValue(true);

            const result = await controller.checkDb();

            expect(result).toHaveProperty('database');
            expect(result).toHaveProperty('timestamp');
            expect(typeof result.database).toBe('string');
            expect(typeof result.timestamp).toBe('string');
            expect(['healthy', 'unhealthy']).toContain(result.database);
        });
    });

    describe('性能测试', () => {
        it('应该在合理时间内响应健康检查', async () => {
            const mockDbStatus = { status: 'healthy' };
            mockHealthService.getDatabaseStatus.mockResolvedValue(mockDbStatus);

            const startTime = Date.now();
            await controller.check();
            const endTime = Date.now();

            const duration = endTime - startTime;
            expect(duration).toBeLessThan(100); // 应该在100ms内完成
        });

        it('应该在合理时间内响应数据库检查', async () => {
            mockHealthService.checkDatabaseHealth.mockResolvedValue(true);

            const startTime = Date.now();
            await controller.checkDb();
            const endTime = Date.now();

            const duration = endTime - startTime;
            expect(duration).toBeLessThan(50); // 应该在50ms内完成
        });
    });

    describe('边界条件测试', () => {
        it('应该处理数据库状态为复杂对象的情况', async () => {
            const complexDbStatus = {
                status: 'connected',
                version: 'PostgreSQL 14.0',
                connections: 25,
                driver: 'postgres',
                uptime: 86400,
            };
            mockHealthService.getDatabaseStatus.mockResolvedValue(complexDbStatus);

            const result = await controller.check();

            expect(result.database).toEqual(complexDbStatus);
        });

        it('应该处理数据库状态为 null 的情况', async () => {
            mockHealthService.getDatabaseStatus.mockResolvedValue(null);

            const result = await controller.check();

            expect(result.database).toBeNull();
            expect(result.status).toBe('ok'); // 整体状态仍然是 ok
        });

        it('应该处理长时间运行的情况', async () => {
            const mockDbStatus = { status: 'healthy' };
            mockHealthService.getDatabaseStatus.mockResolvedValue(mockDbStatus);

            // 模拟长时间运行（通过 mock process.uptime）
            const originalUptime = process.uptime;
            vi.spyOn(process, 'uptime').mockReturnValue(7200); // 2小时

            const result = await controller.check();

            expect(result.uptime).toBe('120m 0s');

            // 恢复原始函数
            process.uptime = originalUptime;
        });
    });
});

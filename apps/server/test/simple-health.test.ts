import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HealthService } from '../src/database/health.service';
import { HealthController } from '../src/health/health.controller';

describe('HealthController', () => {
    let controller: HealthController;
    let service: HealthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [
                {
                    provide: HealthService,
                    useValue: {
                        getDatabaseStatus: vi.fn().mockResolvedValue({
                            status: 'connected',
                            version: 'PostgreSQL 16.8',
                            connections: 6,
                            driver: 'postgres',
                            latency: 5,
                        }),
                        getSystemStatus: vi.fn().mockReturnValue({
                            memory: {
                                total: '16GB',
                                free: '8GB',
                                used: '8GB',
                                usedPercent: 50,
                            },
                            cpu: {
                                loadAvg: [1.5, 1.2, 1.0],
                                cores: 8,
                            },
                            hostname: 'test-host',
                            platform: 'Darwin 24.6.0',
                            uptime: '1h 30m',
                        }),
                        getFullHealthStatus: vi.fn().mockResolvedValue({
                            status: 'ok',
                            timestamp: new Date().toISOString(),
                            uptime: '1h 30m',
                            database: { status: 'connected' },
                            system: {
                                memory: { total: '16GB', free: '8GB', used: '8GB', usedPercent: 50 },
                                cpu: { loadAvg: [1.5, 1.2, 1.0], cores: 8 },
                                hostname: 'test-host',
                                platform: 'Darwin 24.6.0',
                                uptime: '1h 30m',
                            },
                        }),
                    },
                },
            ],
        }).compile();

        controller = module.get<HealthController>(HealthController);
        service = module.get<HealthService>(HealthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should have basic functionality', () => {
        expect(typeof controller).toBe('object');
    });

    it('should call health service methods', async () => {
        const result = await controller.check();
        expect(service.getDatabaseStatus).toHaveBeenCalled();
        expect(result).toBeDefined();
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HealthService } from '../src/database/health.service';
import { HealthController } from '../src/health/health.controller';

describe('Health Integration', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            checkDatabaseHealth: vi.fn().mockResolvedValue(true),
            getDatabaseStatus: vi.fn().mockResolvedValue({
              status: 'connected',
              version: 'PostgreSQL 16.8',
              connections: 6,
              driver: 'postgres',
            }),
          },
        },
        {
          provide: DataSource,
          useValue: {
            isInitialized: true,
            query: vi.fn().mockResolvedValue([{ version: 'PostgreSQL 16.8' }]),
            createQueryRunner: vi.fn().mockReturnValue({
              query: vi.fn().mockResolvedValue([{ connections: '6' }]),
              release: vi.fn().mockResolvedValue(undefined),
            }),
            driver: {
              options: {
                type: 'postgres',
              },
            },
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should have basic functionality', () => {
    expect(typeof controller).toBe('object');
    expect(typeof service).toBe('object');
  });

  it('should check database health', async () => {
    const result = await service.checkDatabaseHealth();
    expect(typeof result).toBe('boolean');
  });

  it('should get database status', async () => {
    const result = await service.getDatabaseStatus();
    expect(result).toHaveProperty('status');
    expect(result.status).toBe('connected');
  });

  it('should handle health check endpoint', async () => {
    // 调试：检查controller和service是否正确注入
    console.log('Controller:', controller);
    console.log('Service:', service);
    console.log('Controller healthService:', (controller as any).healthService);
    
    const result = await controller.check();
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('database');
    expect(result).toHaveProperty('memory');
  });
});

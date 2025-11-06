import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { register } from 'prom-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;
  let mockDataSource: any;

  beforeEach(async () => {
    register.clear();

    // 创建完整的 DataSource Mock
    mockDataSource = {
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
      getRepository: vi.fn(),
      createEntityManager: vi.fn(),
      transaction: vi.fn(),
      close: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have basic functionality', () => {
    expect(typeof service).toBe('object');
  });
});

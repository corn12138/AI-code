import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HealthService } from '../database/health.service';

describe('HealthService', () => {
  let service: HealthService;
  let mockDataSource: any;

  beforeEach(async () => {
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
        HealthService,
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have basic functionality', () => {
    expect(typeof service).toBe('object');
  });
});

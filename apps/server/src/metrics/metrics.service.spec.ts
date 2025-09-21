import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';
import { DataSource } from 'typeorm';
import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { register } from 'prom-client';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(async () => {
    register.clear();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
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

    service = module.get<MetricsService>(MetricsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have basic functionality', () => {
    expect(typeof service).toBe('object');
  });
});

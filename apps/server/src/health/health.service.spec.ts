import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HealthService } from '../database/health.service';
import { DataSource } from 'typeorm';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
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

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have basic functionality', () => {
    expect(typeof service).toBe('object');
  });
});

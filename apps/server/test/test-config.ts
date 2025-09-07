import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { vi } from 'vitest';

// Mock DataSource
export const mockDataSource = {
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
};

// Mock Repository
export const mockRepository = {
  findOne: vi.fn(),
  save: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  find: vi.fn(),
  count: vi.fn(),
  query: vi.fn(),
};

// 创建测试模块的辅助函数
export async function createTestingModule(providers: any[], controllers: any[] = []) {
  return Test.createTestingModule({
    controllers,
    providers: [
      ...providers,
      {
        provide: DataSource,
        useValue: mockDataSource,
      },
    ],
  }).compile();
}

// 通用的mock数据
export const mockHealthData = {
  status: 'connected',
  version: 'PostgreSQL 16.8',
  connections: 6,
  driver: 'postgres',
  latency: 5,
};

export const mockSystemData = {
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
};

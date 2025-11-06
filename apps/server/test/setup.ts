/**
 * Vitest 测试设置文件
 * 基于最新的 Vitest 3.x 特性优化
 */

import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

// ===== 全局测试配置 =====
beforeAll(async () => {
  console.log('🧪 测试环境初始化...');

  // 设置测试环境变量
  process.env.NODE_ENV = 'test';
  process.env.TYPEORM_LOGGING = 'false';
  process.env.TYPEORM_SYNCHRONIZE = 'false';
  process.env.LOG_LEVEL = 'error';

  // 设置测试超时
  vi.setConfig({
    testTimeout: 30000,
    hookTimeout: 30000,
  });
});

afterAll(async () => {
  console.log('🧹 测试环境清理...');

  // 清理全局状态
  vi.clearAllMocks();
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

beforeEach(() => {
  // 每个测试前清理 mock
  vi.clearAllMocks();
});

afterEach(() => {
  // 每个测试后恢复 mock
  vi.restoreAllMocks();
});

// ===== 全局 Mock 设置 =====

// Mock console 方法以减少测试输出噪音
const originalConsole = console;
global.console = {
  ...originalConsole,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
} as any;

// Mock 数据库相关模块
vi.mock('typeorm', async () => {
  const actual = await vi.importActual('typeorm');
  return {
    ...actual,
    DataSource: vi.fn().mockImplementation(() => ({
      isInitialized: true,
      query: vi.fn().mockResolvedValue([]),
      createQueryRunner: vi.fn().mockReturnValue({
        query: vi.fn().mockResolvedValue([]),
        release: vi.fn().mockResolvedValue(undefined),
      }),
      driver: {
        options: { type: 'postgres' },
      },
    })),
  };
});

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  compare: vi.fn().mockResolvedValue(true),
  hash: vi.fn().mockResolvedValue('hashed_password'),
}));

// Mock JWT
vi.mock('@nestjs/jwt', () => ({
  JwtService: vi.fn().mockImplementation(() => ({
    sign: vi.fn().mockReturnValue('mock-jwt-token'),
    signAsync: vi.fn().mockResolvedValue('mock-jwt-token'),
    verify: vi.fn().mockReturnValue({ sub: 'user-id', iat: Date.now() }),
    verifyAsync: vi.fn().mockResolvedValue({ sub: 'user-id', iat: Date.now() }),
  })),
}));

// Mock ConfigService
vi.mock('@nestjs/config', () => ({
  ConfigService: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockImplementation((key: string) => {
      const config = {
        JWT_SECRET: 'test-jwt-secret',
        JWT_ACCESS_EXPIRATION: '15m',
        JWT_REFRESH_EXPIRATION: '7d',
        DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      };
      return config[key];
    }),
  })),
}));

// ===== 测试工具函数 =====

/**
 * 创建测试用的用户数据
 */
export const createTestUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashed_password',
  roles: ['user'],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * 创建测试用的移动端文档数据
 */
export const createTestMobileDoc = (overrides = {}) => ({
  id: 'test-doc-id',
  title: 'Test Document',
  content: 'Test content',
  summary: 'Test summary',
  author: 'Test Author',
  category: 'frontend',
  tags: ['javascript', 'react'],
  isHot: false,
  published: true,
  readTime: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * 创建测试用的文章数据
 */
export const createTestArticle = (overrides = {}) => ({
  id: 'test-article-id',
  title: 'Test Article',
  content: 'Test article content',
  summary: 'Test article summary',
  published: true,
  featuredImage: 'test-image.jpg',
  slug: 'test-article',
  viewCount: 0,
  authorId: 'test-user-id',
  categoryId: 'test-category-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * 等待异步操作完成
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 创建模拟的 HTTP 请求
 */
export const createMockRequest = (overrides = {}) => ({
  method: 'GET',
  url: '/test',
  headers: {},
  body: {},
  params: {},
  query: {},
  user: null,
  ...overrides,
});

/**
 * 创建模拟的 HTTP 响应
 */
export const createMockResponse = (overrides = {}) => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  send: vi.fn().mockReturnThis(),
  cookie: vi.fn().mockReturnThis(),
  clearCookie: vi.fn().mockReturnThis(),
  setHeader: vi.fn().mockReturnThis(),
  ...overrides,
});

/**
 * 创建模拟的 NestJS 执行上下文
 */
export const createMockExecutionContext = (request = {}, response = {}) => ({
  switchToHttp: () => ({
    getRequest: () => createMockRequest(request),
    getResponse: () => createMockResponse(response),
  }),
  getHandler: vi.fn(),
  getClass: vi.fn(),
  getArgs: vi.fn(),
  getArgByIndex: vi.fn(),
  switchToRpc: vi.fn(),
  switchToWs: vi.fn(),
});

// ===== 性能监控工具 =====

/**
 * 性能测试工具
 */
export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  static start(label: string): void {
    this.timers.set(label, performance.now());
  }

  static end(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      throw new Error(`Timer "${label}" not found`);
    }
    const duration = performance.now() - startTime;
    this.timers.delete(label);
    return duration;
  }

  static measure<T>(label: string, fn: () => T | Promise<T>): Promise<{ result: T; duration: number }> {
    return new Promise(async (resolve, reject) => {
      this.start(label);
      try {
        const result = await fn();
        const duration = this.end(label);
        resolve({ result, duration });
      } catch (error) {
        this.timers.delete(label);
        reject(error);
      }
    });
  }
}

// ===== 测试数据工厂 =====

/**
 * 测试数据工厂
 */
export class TestDataFactory {
  static user = {
    create: createTestUser,
    createMany: (count: number) => Array.from({ length: count }, () => createTestUser()),
  };

  static mobileDoc = {
    create: createTestMobileDoc,
    createMany: (count: number) => Array.from({ length: count }, () => createTestMobileDoc()),
  };

  static article = {
    create: createTestArticle,
    createMany: (count: number) => Array.from({ length: count }, () => createTestArticle()),
  };
}

// ===== 全局测试工具 =====

// 导出常用的测试工具
export {
  afterAll, afterEach, beforeAll, beforeEach, describe, expect, it,
  test, vi
} from 'vitest';

// 注意：以上类和函数已经在文件中定义时直接导出，无需重复导出


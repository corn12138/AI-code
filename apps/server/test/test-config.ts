import { ConfigModule } from '@nestjs/config';

/**
 * 测试数据库配置
 */
export const testDatabaseConfig = {
  type: 'postgres' as const,
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '5432'),
  username: process.env.TEST_DB_USERNAME || 'test_user',
  password: process.env.TEST_DB_PASSWORD || 'test_password',
  database: process.env.TEST_DB_NAME || 'test_db',
  synchronize: true, // 测试环境可以使用同步
  dropSchema: true, // 每次测试前清空数据库
  logging: false,
  entities: [], // 将在测试中动态添加
  migrations: [],
  subscribers: [],
};

/**
 * 内存数据库配置（用于快速单元测试）
 */
export const memoryDatabaseConfig = {
  type: 'sqlite' as const,
  database: ':memory:',
  synchronize: true,
  dropSchema: true,
  logging: false,
  entities: [],
};

/**
 * 测试模块配置
 */
export const testModuleConfig = {
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test',
    }),
  ],
};

/**
 * JWT 测试配置
 */
export const jwtTestConfig = {
  secret: 'test-jwt-secret-for-testing-only',
  signOptions: {
    expiresIn: '1h',
  },
};

/**
 * 缓存测试配置
 */
export const cacheTestConfig = {
  store: 'memory',
  ttl: 60, // 1分钟
  max: 100, // 最多100个条目
};

/**
 * 测试用户数据
 */
export const testUsers = {
  admin: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'admin@test.com',
    username: 'admin',
    password: 'Admin123!',
    role: 'admin',
  },
  user: {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'user@test.com',
    username: 'testuser',
    password: 'User123!',
    role: 'user',
  },
  editor: {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'editor@test.com',
    username: 'editor',
    password: 'Editor123!',
    role: 'editor',
  },
};

/**
 * 测试文章数据
 */
export const testArticles = {
  published: {
    id: '660e8400-e29b-41d4-a716-446655440000',
    title: 'Test Published Article',
    content: 'This is a test published article content.',
    summary: 'Test summary',
    status: 'published',
    authorId: testUsers.user.id,
  },
  draft: {
    id: '660e8400-e29b-41d4-a716-446655440001',
    title: 'Test Draft Article',
    content: 'This is a test draft article content.',
    summary: 'Test draft summary',
    status: 'draft',
    authorId: testUsers.user.id,
  },
};

/**
 * 测试标签数据
 */
export const testTags = [
  {
    id: '770e8400-e29b-41d4-a716-446655440000',
    name: 'JavaScript',
    slug: 'javascript',
    description: 'JavaScript programming language',
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440001',
    name: 'TypeScript',
    slug: 'typescript',
    description: 'TypeScript programming language',
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440002',
    name: 'Node.js',
    slug: 'nodejs',
    description: 'Node.js runtime environment',
  },
];

/**
 * API 测试配置
 */
export const apiTestConfig = {
  baseUrl: 'http://localhost:3001',
  timeout: 30000,
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * 性能测试配置
 */
export const performanceTestConfig = {
  // 负载测试配置
  load: {
    duration: '30s',
    vus: 10, // 虚拟用户数
    thresholds: {
      http_req_duration: ['p(95)<500'], // 95% 的请求应在 500ms 内完成
      http_req_failed: ['rate<0.1'], // 错误率应低于 10%
    },
  },
  // 压力测试配置
  stress: {
    stages: [
      { duration: '10s', target: 10 },
      { duration: '20s', target: 50 },
      { duration: '10s', target: 100 },
      { duration: '20s', target: 50 },
      { duration: '10s', target: 0 },
    ],
  },
};

/**
 * 测试环境检查
 */
export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * 等待函数（用于异步测试）
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 生成随机测试数据
 */
export const testDataGenerator = {
  randomString: (length: number = 10): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  randomEmail: (): string => {
    return `test${Date.now()}@example.com`;
  },

  randomUUID: (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  randomDate: (start?: Date, end?: Date): Date => {
    const startTime = start ? start.getTime() : Date.now() - 365 * 24 * 60 * 60 * 1000;
    const endTime = end ? end.getTime() : Date.now();
    return new Date(startTime + Math.random() * (endTime - startTime));
  },
};
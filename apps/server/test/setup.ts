import 'reflect-metadata';

// 全局测试设置
beforeAll(async () => {
  // 设置测试环境变量
  process.env.NODE_ENV = 'test';
  process.env.TYPEORM_LOGGING = 'false';
  process.env.TYPEORM_SYNCHRONIZE = 'false';
  process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
  process.env.JWT_ACCESS_EXPIRATION = '15m';
  process.env.JWT_REFRESH_EXPIRATION = '7d';
  process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/test_db';

  // 设置时区
  process.env.TZ = 'UTC';

  console.log('🧪 Test environment initialized');
});

afterAll(async () => {
  console.log('🧹 Test environment cleaned up');
});

// 每个测试前的设置
beforeEach(() => {
  // 可以在这里添加每个测试前的设置
});

// 每个测试后的清理
afterEach(() => {
  // 可以在这里添加每个测试后的清理
});

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

export { };

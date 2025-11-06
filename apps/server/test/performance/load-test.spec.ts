import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppModule } from '../../src/app.module';
import { MobileDoc } from '../../src/mobile/entities/mobile-doc.entity';
import { User } from '../../src/user/entities/user.entity';
import { factories } from '../factories';
import { testDatabaseConfig } from '../test-config';
import { ApiTestHelper, DatabaseTestHelper, PerformanceTestHelper } from '../utils/test-helpers';

describe('Load Tests', () => {
  let app: INestApplication;
  let apiHelper: ApiTestHelper;
  let dbHelper: DatabaseTestHelper;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...testDatabaseConfig,
          entities: [User, MobileDoc],
        }),
        AppModule,
      ],
    })
      .overrideProvider(getDataSourceToken())
      .useValue({
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
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    apiHelper = new ApiTestHelper(app);
    dbHelper = new DatabaseTestHelper(app.get('DataSource'));
  });

  afterAll(async () => {
    await app.close();
    await moduleRef.close();
  });

  beforeEach(async () => {
    await dbHelper.clearDatabase();

    // 创建测试数据
    const docs = Array.from({ length: 50 }, (_, i) =>
      factories.mobileDoc.create({
        title: `Load Test Document ${i + 1}`,
        category: ['frontend', 'backend', 'mobile', 'ai', 'devops'][i % 5],
        isHot: i % 10 === 0,
      })
    );

    const createPromises = docs.map(doc =>
      apiHelper.publicRequest('post', '/mobile/docs').send(doc)
    );

    await Promise.all(createPromises);
  });

  describe('API 端点负载测试', () => {
    it('应该在高并发下处理文档列表请求', async () => {
      const concurrency = 5;
      const iterations = 20;

      const testFunction = async () => {
        const response = await apiHelper.publicRequest('get', '/mobile/docs')
          .query({ page: 1, pageSize: 10 });

        expect(response.status).toBe(200);
        expect(response.body.items).toHaveLength(10);
        return response.body;
      };

      const result = await PerformanceTestHelper.concurrentTest(
        testFunction,
        concurrency,
        iterations
      );

      console.log(`负载测试结果:`);
      console.log(`- 总请求数: ${iterations}`);
      console.log(`- 并发数: ${concurrency}`);
      console.log(`- 总耗时: ${result.totalDuration.toFixed(2)}ms`);
      console.log(`- 平均响应时间: ${result.averageDuration.toFixed(2)}ms`);

      expect(result.averageDuration).toBeLessThan(1000);
      expect(result.results).toHaveLength(iterations);
    });

    it('应该在高并发下处理文档搜索请求', async () => {
      const testFunction = async () => {
        const response = await apiHelper.publicRequest('get', '/mobile/docs')
          .query({ search: 'Load', pageSize: 10 });

        expect(response.status).toBe(200);
        return response.body;
      };

      const result = await PerformanceTestHelper.concurrentTest(
        testFunction,
        3,
        15
      );

      expect(result.averageDuration).toBeLessThan(1500);
    });

    it('应该测量单个请求的执行时间', async () => {
      const { result, duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
        const response = await apiHelper.publicRequest('get', '/mobile/docs/hot');
        expect(response.status).toBe(200);
        return response.body;
      });

      console.log(`热门文档请求耗时: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(500);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('认证系统负载测试', () => {
    it('应该在并发下处理用户注册', async () => {
      const testFunction = async () => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const userData = {
          email: `test${timestamp}${random}@example.com`,
          username: `test${timestamp}${random}`,
          password: 'Test123!',
        };

        const response = await apiHelper.publicRequest('post', '/auth/register')
          .send(userData);

        expect(response.status).toBe(201);
        return response.body;
      };

      const result = await PerformanceTestHelper.concurrentTest(
        testFunction,
        3,
        10
      );

      expect(result.averageDuration).toBeLessThan(2000);
      expect(result.results).toHaveLength(10);
    });
  });
});
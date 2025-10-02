import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { MobileDoc } from '../../src/mobile/entities/mobile-doc.entity';
import { MobileModule } from '../../src/mobile/mobile.module';
import { factories } from '../factories';
import { performanceTestConfig, testDatabaseConfig } from '../test-config';
import { DatabaseTestHelper, PerformanceTestHelper } from '../utils/test-helpers';

describe('Mobile Performance Tests', () => {
    let app: INestApplication;
    let dbHelper: DatabaseTestHelper;
    let moduleRef: TestingModule;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    ...testDatabaseConfig,
                    entities: [MobileDoc],
                }),
                MobileModule,
            ],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();

        dbHelper = new DatabaseTestHelper(app.get('DataSource'));
    });

    afterAll(async () => {
        await app.close();
        await moduleRef.close();
    });

    beforeEach(async () => {
        await dbHelper.clearDatabase();
    });

    describe('创建操作性能测试', () => {
        it('应该在合理时间内创建单个文档', async () => {
            const doc = factories.mobileDoc.create();

            const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
                await request(app.getHttpServer())
                    .post('/mobile/docs')
                    .send(doc)
                    .expect(201);
            });

            // 单个文档创建应该在500ms内完成
            expect(duration).toBeLessThan(500);
        });

        it('应该高效处理批量创建', async () => {
            const docs = factories.mobileDoc.createMany(100);

            const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
                const promises = docs.map(doc =>
                    request(app.getHttpServer())
                        .post('/mobile/docs')
                        .send(doc)
                );

                await Promise.all(promises);
            });

            // 100个文档的批量创建应该在10秒内完成
            expect(duration).toBeLessThan(10000);

            // 平均每个文档创建时间应该在100ms内
            const avgDuration = duration / 100;
            expect(avgDuration).toBeLessThan(100);
        });

        it('应该处理并发创建请求', async () => {
            const concurrency = 20;
            const iterations = 50;

            const { totalDuration, averageDuration } = await PerformanceTestHelper.concurrentTest(
                async () => {
                    const doc = factories.mobileDoc.create({
                        title: `Concurrent Doc ${Math.random()}`,
                    });

                    const response = await request(app.getHttpServer())
                        .post('/mobile/docs')
                        .send(doc);

                    return response.status;
                },
                concurrency,
                iterations
            );

            // 所有请求都应该成功
            expect(totalDuration).toBeLessThan(30000); // 30秒内完成
            expect(averageDuration).toBeLessThan(600); // 平均每个请求600ms内完成
        });
    });

    describe('查询操作性能测试', () => {
        beforeEach(async () => {
            // 创建大量测试数据
            const docs = [
                ...factories.mobileDoc.createMany(500, { category: 'frontend' }),
                ...factories.mobileDoc.createMany(300, { category: 'backend' }),
                ...factories.mobileDoc.createMany(200, { category: 'mobile' }),
            ];

            // 批量插入数据
            const batchSize = 50;
            for (let i = 0; i < docs.length; i += batchSize) {
                const batch = docs.slice(i, i + batchSize);
                const promises = batch.map(doc =>
                    request(app.getHttpServer())
                        .post('/mobile/docs')
                        .send(doc)
                );
                await Promise.all(promises);
            }
        });

        it('应该快速执行分页查询', async () => {
            const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
                await request(app.getHttpServer())
                    .get('/mobile/docs')
                    .query({ page: 1, pageSize: 20 })
                    .expect(200);
            });

            // 分页查询应该在200ms内完成
            expect(duration).toBeLessThan(200);
        });

        it('应该高效处理分类过滤查询', async () => {
            const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
                await request(app.getHttpServer())
                    .get('/mobile/docs')
                    .query({ category: 'frontend', page: 1, pageSize: 50 })
                    .expect(200);
            });

            // 分类过滤查询应该在300ms内完成
            expect(duration).toBeLessThan(300);
        });

        it('应该高效处理搜索查询', async () => {
            const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
                await request(app.getHttpServer())
                    .get('/mobile/docs')
                    .query({ search: 'test', page: 1, pageSize: 20 })
                    .expect(200);
            });

            // 搜索查询应该在500ms内完成
            expect(duration).toBeLessThan(500);
        });

        it('应该快速执行单个文档查询', async () => {
            // 先创建一个文档
            const doc = factories.mobileDoc.create();
            const createResponse = await request(app.getHttpServer())
                .post('/mobile/docs')
                .send(doc)
                .expect(201);

            const docId = createResponse.body.id;

            const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
                await request(app.getHttpServer())
                    .get(`/mobile/docs/${docId}`)
                    .expect(200);
            });

            // 单个文档查询应该在100ms内完成
            expect(duration).toBeLessThan(100);
        });

        it('应该高效处理热门文档查询', async () => {
            const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
                await request(app.getHttpServer())
                    .get('/mobile/docs/hot')
                    .query({ limit: 10 })
                    .expect(200);
            });

            // 热门文档查询应该在200ms内完成
            expect(duration).toBeLessThan(200);
        });

        it('应该高效处理相关文档查询', async () => {
            // 先获取一个文档ID
            const listResponse = await request(app.getHttpServer())
                .get('/mobile/docs')
                .query({ page: 1, pageSize: 1 })
                .expect(200);

            const docId = listResponse.body.items[0].id;

            const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
                await request(app.getHttpServer())
                    .get(`/mobile/docs/${docId}/related`)
                    .query({ limit: 5 })
                    .expect(200);
            });

            // 相关文档查询应该在300ms内完成
            expect(duration).toBeLessThan(300);
        });

        it('应该快速执行统计查询', async () => {
            const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
                await request(app.getHttpServer())
                    .get('/mobile/stats')
                    .expect(200);
            });

            // 统计查询应该在200ms内完成
            expect(duration).toBeLessThan(200);
        });
    });

    describe('更新操作性能测试', () => {
        let docIds: string[] = [];

        beforeEach(async () => {
            // 创建测试文档
            const docs = factories.mobileDoc.createMany(100);
            const responses = [];

            for (const doc of docs) {
                const response = await request(app.getHttpServer())
                    .post('/mobile/docs')
                    .send(doc)
                    .expect(201);
                responses.push(response);
            }

            docIds = responses.map(response => response.body.id);
        });

        it('应该快速执行单个文档更新', async () => {
            const docId = docIds[0];
            const updateDto = {
                title: 'Updated Title',
                isHot: true,
            };

            const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
                await request(app.getHttpServer())
                    .put(`/mobile/docs/${docId}`)
                    .send(updateDto)
                    .expect(200);
            });

            // 单个文档更新应该在300ms内完成
            expect(duration).toBeLessThan(300);
        });

        it('应该高效处理批量更新', async () => {
            const updatePromises = docIds.slice(0, 50).map((docId, index) => {
                return request(app.getHttpServer())
                    .put(`/mobile/docs/${docId}`)
                    .send({ title: `Batch Updated Title ${index}` });
            });

            const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
                await Promise.all(updatePromises);
            });

            // 50个文档的批量更新应该在15秒内完成
            expect(duration).toBeLessThan(15000);
        });

        it('应该处理并发更新请求', async () => {
            const concurrency = 10;
            const iterations = 30;

            const { totalDuration, averageDuration } = await PerformanceTestHelper.concurrentTest(
                async () => {
                    const docId = docIds[Math.floor(Math.random() * docIds.length)];
                    const response = await request(app.getHttpServer())
                        .put(`/mobile/docs/${docId}`)
                        .send({ title: `Concurrent Update ${Math.random()}` });

                    return response.status;
                },
                concurrency,
                iterations
            );

            expect(totalDuration).toBeLessThan(20000); // 20秒内完成
            expect(averageDuration).toBeLessThan(700); // 平均每个请求700ms内完成
        });
    });

    describe('删除操作性能测试', () => {
        let docIds: string[] = [];

        beforeEach(async () => {
            // 创建测试文档
            const docs = factories.mobileDoc.createMany(100);
            const responses = [];

            for (const doc of docs) {
                const response = await request(app.getHttpServer())
                    .post('/mobile/docs')
                    .send(doc)
                    .expect(201);
                responses.push(response);
            }

            docIds = responses.map(response => response.body.id);
        });

        it('应该快速执行单个文档删除', async () => {
            const docId = docIds[0];

            const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
                await request(app.getHttpServer())
                    .delete(`/mobile/docs/${docId}`)
                    .expect(200);
            });

            // 单个文档删除应该在200ms内完成
            expect(duration).toBeLessThan(200);
        });

        it('应该高效处理批量删除', async () => {
            const deletePromises = docIds.slice(0, 50).map(docId => {
                return request(app.getHttpServer())
                    .delete(`/mobile/docs/${docId}`);
            });

            const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
                await Promise.all(deletePromises);
            });

            // 50个文档的批量删除应该在10秒内完成
            expect(duration).toBeLessThan(10000);
        });
    });

    describe('内存使用测试', () => {
        it('应该在大量操作后保持合理的内存使用', async () => {
            const initialMemory = process.memoryUsage();

            // 执行大量操作
            for (let i = 0; i < 10; i++) {
                const docs = factories.mobileDoc.createMany(100);

                // 创建文档
                const createPromises = docs.map(doc =>
                    request(app.getHttpServer())
                        .post('/mobile/docs')
                        .send(doc)
                );

                const responses = await Promise.all(createPromises);
                const docIds = responses.map(response => response.body.id);

                // 查询文档
                await request(app.getHttpServer())
                    .get('/mobile/docs')
                    .query({ page: 1, pageSize: 50 });

                // 删除文档
                const deletePromises = docIds.map(docId =>
                    request(app.getHttpServer())
                        .delete(`/mobile/docs/${docId}`)
                );

                await Promise.all(deletePromises);

                // 强制垃圾回收（如果可用）
                if (global.gc) {
                    global.gc();
                }
            }

            const finalMemory = process.memoryUsage();
            const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

            // 内存增长应该控制在合理范围内（100MB）
            expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
        });
    });

    describe('负载测试', () => {
        it('应该在高负载下保持稳定性能', async () => {
            const loadTestConfig = performanceTestConfig.load;
            const startTime = Date.now();
            const endTime = startTime + 30000; // 30秒测试
            const results: number[] = [];

            while (Date.now() < endTime) {
                const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
                    const doc = factories.mobileDoc.create();
                    await request(app.getHttpServer())
                        .post('/mobile/docs')
                        .send(doc);
                });

                results.push(duration);

                // 控制请求频率
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // 计算性能指标
            const avgDuration = results.reduce((sum, duration) => sum + duration, 0) / results.length;
            const p95Duration = results.sort((a, b) => a - b)[Math.floor(results.length * 0.95)];

            expect(avgDuration).toBeLessThan(500); // 平均响应时间应该在500ms内
            expect(p95Duration).toBeLessThan(1000); // 95%的请求应该在1秒内完成
        });
    });

    describe('数据库连接池测试', () => {
        it('应该高效管理数据库连接', async () => {
            const concurrentRequests = 50;

            const promises = Array.from({ length: concurrentRequests }, () => {
                const doc = factories.mobileDoc.create();
                return request(app.getHttpServer())
                    .post('/mobile/docs')
                    .send(doc);
            });

            const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
                const responses = await Promise.all(promises);

                // 验证所有请求都成功
                responses.forEach(response => {
                    expect(response.status).toBe(201);
                });
            });

            // 50个并发请求应该在5秒内完成
            expect(duration).toBeLessThan(5000);
        });
    });
});

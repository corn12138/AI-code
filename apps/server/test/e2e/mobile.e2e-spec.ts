import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { AppModule } from '../../src/app.module';
import { MobileDoc } from '../../src/mobile/entities/mobile-doc.entity';
import { factories } from '../factories';
import { testDatabaseConfig } from '../test-config';
import { DatabaseTestHelper, PerformanceTestHelper } from '../utils/test-helpers';

describe('Mobile E2E Tests', () => {
    let app: INestApplication;
    let dbHelper: DatabaseTestHelper;
    let moduleRef: TestingModule;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideModule(TypeOrmModule.forRoot())
            .useModule(
                TypeOrmModule.forRoot({
                    ...testDatabaseConfig,
                    entities: [MobileDoc],
                })
            )
            .compile();

        app = moduleRef.createNestApplication();

        // 配置全局管道
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));

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

    describe('完整的文档生命周期', () => {
        it('应该支持完整的 CRUD 操作流程', async () => {
            // 1. 创建文档
            const createDto = factories.mobileDoc.create({
                title: 'E2E Test Document',
                content: 'This is an end-to-end test document.',
                category: 'frontend',
                tags: ['e2e', 'testing'],
            });

            const createResponse = await request(app.getHttpServer())
                .post('/mobile/docs')
                .send(createDto)
                .expect(201);

            const docId = createResponse.body.id;
            expect(docId).toBeDefined();

            // 2. 读取文档
            const getResponse = await request(app.getHttpServer())
                .get(`/mobile/docs/${docId}`)
                .expect(200);

            expect(getResponse.body).toMatchObject({
                id: docId,
                title: createDto.title,
                content: createDto.content,
                category: createDto.category,
                tags: createDto.tags,
            });

            // 3. 更新文档
            const updateDto = {
                title: 'Updated E2E Test Document',
                isHot: true,
            };

            const updateResponse = await request(app.getHttpServer())
                .put(`/mobile/docs/${docId}`)
                .send(updateDto)
                .expect(200);

            expect(updateResponse.body.title).toBe(updateDto.title);
            expect(updateResponse.body.isHot).toBe(true);

            // 4. 验证更新
            const getUpdatedResponse = await request(app.getHttpServer())
                .get(`/mobile/docs/${docId}`)
                .expect(200);

            expect(getUpdatedResponse.body.title).toBe(updateDto.title);
            expect(getUpdatedResponse.body.isHot).toBe(true);

            // 5. 删除文档
            await request(app.getHttpServer())
                .delete(`/mobile/docs/${docId}`)
                .expect(200);

            // 6. 验证删除
            await request(app.getHttpServer())
                .get(`/mobile/docs/${docId}`)
                .expect(404);
        });
    });

    describe('复杂查询场景', () => {
        beforeEach(async () => {
            // 创建测试数据集
            const testDocs = [
                factories.mobileDoc.createFrontendDoc({
                    title: 'React Hooks Guide',
                    tags: ['react', 'hooks', 'frontend'],
                    isHot: true,
                }),
                factories.mobileDoc.createFrontendDoc({
                    title: 'Vue.js Components',
                    tags: ['vue', 'components', 'frontend'],
                    isHot: false,
                }),
                factories.mobileDoc.createBackendDoc({
                    title: 'Node.js API Development',
                    tags: ['nodejs', 'api', 'backend'],
                    isHot: true,
                }),
                factories.mobileDoc.createBackendDoc({
                    title: 'Database Design Patterns',
                    tags: ['database', 'patterns', 'backend'],
                    isHot: false,
                }),
                factories.mobileDoc.create({
                    category: 'mobile',
                    title: 'React Native Performance',
                    tags: ['react-native', 'performance', 'mobile'],
                    isHot: true,
                }),
            ];

            for (const doc of testDocs) {
                await request(app.getHttpServer())
                    .post('/mobile/docs')
                    .send(doc)
                    .expect(201);
            }
        });

        it('应该支持复合查询条件', async () => {
            // 查询前端分类的热门文档
            const response = await request(app.getHttpServer())
                .get('/mobile/docs')
                .query({
                    category: 'frontend',
                    page: 1,
                    pageSize: 10,
                })
                .expect(200);

            expect(response.body.items).toHaveLength(2);
            response.body.items.forEach((doc: any) => {
                expect(doc.category).toBe('frontend');
            });
        });

        it('应该支持搜索功能', async () => {
            const response = await request(app.getHttpServer())
                .get('/mobile/docs')
                .query({
                    search: 'React',
                    page: 1,
                    pageSize: 10,
                })
                .expect(200);

            expect(response.body.items.length).toBeGreaterThan(0);
            response.body.items.forEach((doc: any) => {
                const hasReact = doc.title.includes('React') ||
                    doc.content.includes('React') ||
                    doc.summary?.includes('React');
                expect(hasReact).toBe(true);
            });
        });

        it('应该支持标签过滤', async () => {
            const response = await request(app.getHttpServer())
                .get('/mobile/docs')
                .query({
                    tags: ['react', 'hooks'],
                    page: 1,
                    pageSize: 10,
                })
                .expect(200);

            expect(response.body.items.length).toBeGreaterThan(0);
            response.body.items.forEach((doc: any) => {
                const hasTag = doc.tags.some((tag: string) =>
                    ['react', 'hooks'].includes(tag)
                );
                expect(hasTag).toBe(true);
            });
        });

        it('应该正确返回热门文档', async () => {
            const response = await request(app.getHttpServer())
                .get('/mobile/docs/hot')
                .query({ limit: 10 })
                .expect(200);

            expect(response.body.length).toBe(3); // 3个热门文档
            response.body.forEach((doc: any) => {
                expect(doc.isHot).toBe(true);
            });
        });

        it('应该返回相关文档', async () => {
            // 先获取一个前端文档
            const listResponse = await request(app.getHttpServer())
                .get('/mobile/docs')
                .query({ category: 'frontend' })
                .expect(200);

            const frontendDoc = listResponse.body.items[0];

            // 获取相关文档
            const relatedResponse = await request(app.getHttpServer())
                .get(`/mobile/docs/${frontendDoc.id}/related`)
                .query({ limit: 5 })
                .expect(200);

            expect(Array.isArray(relatedResponse.body)).toBe(true);
            // 相关文档不应包含当前文档
            relatedResponse.body.forEach((doc: any) => {
                expect(doc.id).not.toBe(frontendDoc.id);
            });
        });
    });

    describe('数据验证和错误处理', () => {
        it('应该验证必填字段', async () => {
            const invalidDto = {
                title: 'Test Document',
                // 缺少必填字段
            };

            const response = await request(app.getHttpServer())
                .post('/mobile/docs')
                .send(invalidDto)
                .expect(400);

            expect(response.body).toHaveProperty('message');
            expect(Array.isArray(response.body.message)).toBe(true);
        });

        it('应该验证字段类型', async () => {
            const invalidDto = {
                title: 'Test Document',
                content: 'Test content',
                author: 'Test Author',
                category: 'frontend',
                readTime: 'invalid-number', // 应该是数字
                tags: 'invalid-array', // 应该是数组
            };

            await request(app.getHttpServer())
                .post('/mobile/docs')
                .send(invalidDto)
                .expect(400);
        });

        it('应该验证枚举值', async () => {
            const invalidDto = {
                title: 'Test Document',
                content: 'Test content',
                author: 'Test Author',
                category: 'invalid-category', // 无效的分类
            };

            await request(app.getHttpServer())
                .post('/mobile/docs')
                .send(invalidDto)
                .expect(400);
        });

        it('应该处理不存在的资源', async () => {
            const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

            await request(app.getHttpServer())
                .get(`/mobile/docs/${nonExistentId}`)
                .expect(404);

            await request(app.getHttpServer())
                .put(`/mobile/docs/${nonExistentId}`)
                .send({ title: 'Updated Title' })
                .expect(404);

            await request(app.getHttpServer())
                .delete(`/mobile/docs/${nonExistentId}`)
                .expect(404);
        });

        it('应该处理无效的 UUID 格式', async () => {
            const invalidId = 'invalid-uuid-format';

            await request(app.getHttpServer())
                .get(`/mobile/docs/${invalidId}`)
                .expect(400);
        });
    });

    describe('性能测试', () => {
        it('应该在合理时间内处理大量数据', async () => {
            // 创建大量测试数据
            const createPromises = Array.from({ length: 100 }, (_, index) => {
                const doc = factories.mobileDoc.create({
                    title: `Performance Test Doc ${index}`,
                });

                return request(app.getHttpServer())
                    .post('/mobile/docs')
                    .send(doc);
            });

            const { totalDuration } = await PerformanceTestHelper.measureExecutionTime(
                async () => {
                    await Promise.all(createPromises);
                }
            );

            // 创建100个文档应该在10秒内完成
            expect(totalDuration).toBeLessThan(10000);

            // 测试查询性能
            const { duration: queryDuration } = await PerformanceTestHelper.measureExecutionTime(
                async () => {
                    await request(app.getHttpServer())
                        .get('/mobile/docs')
                        .query({ page: 1, pageSize: 50 })
                        .expect(200);
                }
            );

            // 查询应该在1秒内完成
            expect(queryDuration).toBeLessThan(1000);
        });

        it('应该处理并发请求', async () => {
            const concurrentRequests = 20;
            const doc = factories.mobileDoc.create();

            const { results } = await PerformanceTestHelper.concurrentTest(
                async () => {
                    const response = await request(app.getHttpServer())
                        .post('/mobile/docs')
                        .send({
                            ...doc,
                            title: `Concurrent Doc ${Math.random()}`, // 确保唯一性
                        });
                    return response.status;
                },
                concurrentRequests,
                concurrentRequests
            );

            // 所有请求都应该成功
            results.forEach(status => {
                expect(status).toBe(201);
            });
        });
    });

    describe('边界条件测试', () => {
        it('应该处理极大的分页参数', async () => {
            await request(app.getHttpServer())
                .get('/mobile/docs')
                .query({ page: 999999, pageSize: 1000 })
                .expect(200);
        });

        it('应该处理空的搜索结果', async () => {
            const response = await request(app.getHttpServer())
                .get('/mobile/docs')
                .query({ search: 'nonexistent-keyword-xyz' })
                .expect(200);

            expect(response.body.items).toHaveLength(0);
            expect(response.body.total).toBe(0);
        });

        it('应该处理特殊字符', async () => {
            const docWithSpecialChars = factories.mobileDoc.create({
                title: 'Test with special chars: !@#$%^&*()',
                content: 'Content with unicode: 中文测试 🚀 emoji',
                tags: ['special-chars', 'unicode', 'emoji'],
            });

            const response = await request(app.getHttpServer())
                .post('/mobile/docs')
                .send(docWithSpecialChars)
                .expect(201);

            expect(response.body.title).toBe(docWithSpecialChars.title);
            expect(response.body.content).toBe(docWithSpecialChars.content);
        });
    });

    describe('统计功能测试', () => {
        beforeEach(async () => {
            // 创建不同分类的文档
            const docs = [
                ...factories.mobileDoc.createMany(5, { category: 'frontend' }),
                ...factories.mobileDoc.createMany(3, { category: 'backend' }),
                ...factories.mobileDoc.createMany(2, { category: 'mobile' }),
                ...factories.mobileDoc.createMany(1, { category: 'ai' }),
            ];

            for (const doc of docs) {
                await request(app.getHttpServer())
                    .post('/mobile/docs')
                    .send(doc)
                    .expect(201);
            }
        });

        it('应该返回正确的分类统计', async () => {
            const response = await request(app.getHttpServer())
                .get('/mobile/stats')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);

            const stats = response.body.reduce((acc: any, stat: any) => {
                acc[stat.category] = stat.count;
                return acc;
            }, {});

            expect(stats.frontend).toBe(5);
            expect(stats.backend).toBe(3);
            expect(stats.mobile).toBe(2);
            expect(stats.ai).toBe(1);
        });
    });

    describe('数据一致性测试', () => {
        it('应该保持数据的一致性', async () => {
            // 创建文档
            const doc = factories.mobileDoc.create();
            const createResponse = await request(app.getHttpServer())
                .post('/mobile/docs')
                .send(doc)
                .expect(201);

            const docId = createResponse.body.id;

            // 多次读取应该返回相同的数据
            const responses = await Promise.all([
                request(app.getHttpServer()).get(`/mobile/docs/${docId}`),
                request(app.getHttpServer()).get(`/mobile/docs/${docId}`),
                request(app.getHttpServer()).get(`/mobile/docs/${docId}`),
            ]);

            responses.forEach(response => {
                expect(response.status).toBe(200);
                expect(response.body.id).toBe(docId);
                expect(response.body.title).toBe(doc.title);
            });
        });

        it('应该正确处理并发更新', async () => {
            // 创建文档
            const doc = factories.mobileDoc.create();
            const createResponse = await request(app.getHttpServer())
                .post('/mobile/docs')
                .send(doc)
                .expect(201);

            const docId = createResponse.body.id;

            // 并发更新
            const updatePromises = Array.from({ length: 5 }, (_, index) => {
                return request(app.getHttpServer())
                    .put(`/mobile/docs/${docId}`)
                    .send({ title: `Updated Title ${index}` });
            });

            const updateResponses = await Promise.all(updatePromises);

            // 所有更新都应该成功
            updateResponses.forEach(response => {
                expect(response.status).toBe(200);
            });

            // 最终状态应该是一致的
            const finalResponse = await request(app.getHttpServer())
                .get(`/mobile/docs/${docId}`)
                .expect(200);

            expect(finalResponse.body.title).toMatch(/^Updated Title \d$/);
        });
    });
});

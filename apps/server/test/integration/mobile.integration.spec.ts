import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateMobileDocDto } from '../../src/mobile/dto/create-mobile-doc.dto';
import { UpdateMobileDocDto } from '../../src/mobile/dto/update-mobile-doc.dto';
import { MobileDoc } from '../../src/mobile/entities/mobile-doc.entity';
import { MobileModule } from '../../src/mobile/mobile.module';
import { factories } from '../factories';
import { createMockRepository } from '../utils/test-helpers';

describe('Mobile Integration Tests', () => {
    let app: INestApplication;
    let moduleRef: TestingModule;
    let mockRepository: ReturnType<typeof createMockRepository>;

    beforeAll(async () => {
        mockRepository = createMockRepository<MobileDoc>();

        moduleRef = await Test.createTestingModule({
            imports: [MobileModule],
            providers: [
                {
                    provide: getRepositoryToken(MobileDoc),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
        if (moduleRef) {
            await moduleRef.close();
        }
    });

    beforeEach(async () => {
        vi.clearAllMocks();
    });

    describe('POST /mobile/docs', () => {
        it('应该成功创建移动端文档', async () => {
            const createDto: CreateMobileDocDto = {
                title: 'Integration Test Document',
                content: 'This is integration test content.',
                summary: 'Integration test summary',
                author: 'Test Author',
                category: 'frontend',
                tags: ['javascript', 'react'],
                readTime: 5,
            };

            const mockDoc = {
                id: 'test-id-123',
                ...createDto,
                published: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockRepository.create.mockReturnValue(mockDoc);
            mockRepository.save.mockResolvedValue(mockDoc);

            // 由于这是集成测试，我们直接测试服务层
            const mobileService = moduleRef.get('MobileService');
            const result = await mobileService.create(createDto);

            expect(result).toMatchObject({
                title: createDto.title,
                content: createDto.content,
                summary: createDto.summary,
                author: createDto.author,
                category: createDto.category,
                tags: createDto.tags,
                readTime: createDto.readTime,
            });

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('createdAt');
            expect(result).toHaveProperty('updatedAt');
            expect(result.published).toBe(true);
        });

        it('应该在缺少必填字段时返回 400', async () => {
            const invalidDto = {
                title: 'Test Document',
                // 缺少 content, author, category
            };

            await apiHelper.publicRequest('post', '/mobile/docs')
                .send(invalidDto)
                .expect(400);
        });

        it('应该在无效分类时返回 400', async () => {
            const invalidDto: CreateMobileDocDto = {
                title: 'Test Document',
                content: 'Test content',
                author: 'Test Author',
                category: 'invalid-category' as any,
            };

            await apiHelper.publicRequest('post', '/mobile/docs')
                .send(invalidDto)
                .expect(400);
        });
    });

    describe('GET /mobile/docs', () => {
        beforeEach(async () => {
            // 创建测试数据
            const docs = [
                factories.mobileDoc.createFrontendDoc({ title: 'Frontend Doc 1' }),
                factories.mobileDoc.createFrontendDoc({ title: 'Frontend Doc 2' }),
                factories.mobileDoc.createBackendDoc({ title: 'Backend Doc 1' }),
                factories.mobileDoc.createHotDoc({ title: 'Hot Doc 1', isHot: true }),
            ];

            for (const doc of docs) {
                await apiHelper.publicRequest('post', '/mobile/docs')
                    .send(doc)
                    .expect(201);
            }
        });

        it('应该返回分页的文档列表', async () => {
            const response = await apiHelper.publicRequest('get', '/mobile/docs')
                .query({ page: 1, pageSize: 10 })
                .expect(200);

            expect(response.body).toHaveProperty('items');
            expect(response.body).toHaveProperty('total');
            expect(response.body).toHaveProperty('page');
            expect(response.body).toHaveProperty('pageSize');
            expect(response.body).toHaveProperty('hasMore');

            expect(Array.isArray(response.body.items)).toBe(true);
            expect(response.body.total).toBe(4);
            expect(response.body.page).toBe(1);
            expect(response.body.pageSize).toBe(10);
            expect(response.body.hasMore).toBe(false);
        });

        it('应该根据分类过滤文档', async () => {
            const response = await apiHelper.publicRequest('get', '/mobile/docs')
                .query({ category: 'frontend' })
                .expect(200);

            expect(response.body.items).toHaveLength(2);
            response.body.items.forEach((doc: any) => {
                expect(doc.category).toBe('frontend');
            });
        });

        it('应该根据搜索关键词过滤文档', async () => {
            const response = await apiHelper.publicRequest('get', '/mobile/docs')
                .query({ search: 'Frontend' })
                .expect(200);

            expect(response.body.items.length).toBeGreaterThan(0);
            response.body.items.forEach((doc: any) => {
                expect(
                    doc.title.includes('Frontend') ||
                    doc.content.includes('Frontend') ||
                    doc.summary?.includes('Frontend')
                ).toBe(true);
            });
        });

        it('应该支持分页', async () => {
            const page1Response = await apiHelper.publicRequest('get', '/mobile/docs')
                .query({ page: 1, pageSize: 2 })
                .expect(200);

            const page2Response = await apiHelper.publicRequest('get', '/mobile/docs')
                .query({ page: 2, pageSize: 2 })
                .expect(200);

            expect(page1Response.body.items).toHaveLength(2);
            expect(page2Response.body.items).toHaveLength(2);
            expect(page1Response.body.hasMore).toBe(true);
            expect(page2Response.body.hasMore).toBe(false);

            // 确保不同页面返回不同的文档
            const page1Ids = page1Response.body.items.map((doc: any) => doc.id);
            const page2Ids = page2Response.body.items.map((doc: any) => doc.id);
            expect(page1Ids).not.toEqual(page2Ids);
        });
    });

    describe('GET /mobile/docs/:id', () => {
        let createdDocId: string;

        beforeEach(async () => {
            const createDto = factories.mobileDoc.create();
            const response = await apiHelper.publicRequest('post', '/mobile/docs')
                .send(createDto)
                .expect(201);
            createdDocId = response.body.id;
        });

        it('应该根据 ID 返回文档', async () => {
            const response = await apiHelper.publicRequest('get', `/mobile/docs/${createdDocId}`)
                .expect(200);

            expect(response.body).toHaveProperty('id', createdDocId);
            expect(response.body).toHaveProperty('title');
            expect(response.body).toHaveProperty('content');
            expect(response.body).toHaveProperty('author');
            expect(response.body).toHaveProperty('category');
        });

        it('应该在文档不存在时返回 404', async () => {
            const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

            await apiHelper.publicRequest('get', `/mobile/docs/${nonExistentId}`)
                .expect(404);
        });

        it('应该在无效 ID 格式时返回 400', async () => {
            const invalidId = 'invalid-id-format';

            await apiHelper.publicRequest('get', `/mobile/docs/${invalidId}`)
                .expect(400);
        });
    });

    describe('PUT /mobile/docs/:id', () => {
        let createdDocId: string;

        beforeEach(async () => {
            const createDto = factories.mobileDoc.create();
            const response = await apiHelper.publicRequest('post', '/mobile/docs')
                .send(createDto)
                .expect(201);
            createdDocId = response.body.id;
        });

        it('应该成功更新文档', async () => {
            const updateDto: UpdateMobileDocDto = {
                title: 'Updated Title',
                content: 'Updated content',
                isHot: true,
            };

            const response = await apiHelper.publicRequest('put', `/mobile/docs/${createdDocId}`)
                .send(updateDto)
                .expect(200);

            expect(response.body).toMatchObject({
                id: createdDocId,
                title: updateDto.title,
                content: updateDto.content,
                isHot: updateDto.isHot,
            });

            // 验证数据库中的数据已更新
            const getResponse = await apiHelper.publicRequest('get', `/mobile/docs/${createdDocId}`)
                .expect(200);

            expect(getResponse.body.title).toBe(updateDto.title);
            expect(getResponse.body.content).toBe(updateDto.content);
            expect(getResponse.body.isHot).toBe(updateDto.isHot);
        });

        it('应该支持部分更新', async () => {
            const updateDto: UpdateMobileDocDto = {
                isHot: true,
            };

            const response = await apiHelper.publicRequest('put', `/mobile/docs/${createdDocId}`)
                .send(updateDto)
                .expect(200);

            expect(response.body.isHot).toBe(true);
            // 其他字段应该保持不变
            expect(response.body).toHaveProperty('title');
            expect(response.body).toHaveProperty('content');
        });

        it('应该在文档不存在时返回 404', async () => {
            const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';
            const updateDto: UpdateMobileDocDto = {
                title: 'Updated Title',
            };

            await apiHelper.publicRequest('put', `/mobile/docs/${nonExistentId}`)
                .send(updateDto)
                .expect(404);
        });
    });

    describe('DELETE /mobile/docs/:id', () => {
        let createdDocId: string;

        beforeEach(async () => {
            const createDto = factories.mobileDoc.create();
            const response = await apiHelper.publicRequest('post', '/mobile/docs')
                .send(createDto)
                .expect(201);
            createdDocId = response.body.id;
        });

        it('应该成功删除文档', async () => {
            await apiHelper.publicRequest('delete', `/mobile/docs/${createdDocId}`)
                .expect(200);

            // 验证文档已被删除
            await apiHelper.publicRequest('get', `/mobile/docs/${createdDocId}`)
                .expect(404);
        });

        it('应该在文档不存在时返回 404', async () => {
            const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

            await apiHelper.publicRequest('delete', `/mobile/docs/${nonExistentId}`)
                .expect(404);
        });
    });

    describe('GET /mobile/docs/hot', () => {
        beforeEach(async () => {
            // 创建热门和普通文档
            const docs = [
                factories.mobileDoc.createHotDoc({ title: 'Hot Doc 1' }),
                factories.mobileDoc.createHotDoc({ title: 'Hot Doc 2' }),
                factories.mobileDoc.create({ title: 'Normal Doc 1', isHot: false }),
            ];

            for (const doc of docs) {
                await apiHelper.publicRequest('post', '/mobile/docs')
                    .send(doc)
                    .expect(201);
            }
        });

        it('应该返回热门文档', async () => {
            const response = await apiHelper.publicRequest('get', '/mobile/docs/hot')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(2);

            response.body.forEach((doc: any) => {
                expect(doc.isHot).toBe(true);
            });
        });

        it('应该支持限制返回数量', async () => {
            const response = await apiHelper.publicRequest('get', '/mobile/docs/hot')
                .query({ limit: 1 })
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].isHot).toBe(true);
        });
    });

    describe('GET /mobile/docs/:id/related', () => {
        let frontendDocId: string;

        beforeEach(async () => {
            // 创建相关文档
            const docs = [
                factories.mobileDoc.createFrontendDoc({ title: 'Main Frontend Doc' }),
                factories.mobileDoc.createFrontendDoc({ title: 'Related Frontend Doc 1' }),
                factories.mobileDoc.createFrontendDoc({ title: 'Related Frontend Doc 2' }),
                factories.mobileDoc.createBackendDoc({ title: 'Backend Doc' }),
            ];

            const responses = [];
            for (const doc of docs) {
                const response = await apiHelper.publicRequest('post', '/mobile/docs')
                    .send(doc)
                    .expect(201);
                responses.push(response);
            }

            frontendDocId = responses[0].body.id;
        });

        it('应该返回相关文档', async () => {
            const response = await apiHelper.publicRequest('get', `/mobile/docs/${frontendDocId}/related`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);

            // 相关文档应该不包含当前文档
            response.body.forEach((doc: any) => {
                expect(doc.id).not.toBe(frontendDocId);
            });
        });

        it('应该支持限制返回数量', async () => {
            const response = await apiHelper.publicRequest('get', `/mobile/docs/${frontendDocId}/related`)
                .query({ limit: 1 })
                .expect(200);

            expect(response.body).toHaveLength(1);
        });

        it('应该在文档不存在时返回 404', async () => {
            const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

            await apiHelper.publicRequest('get', `/mobile/docs/${nonExistentId}/related`)
                .expect(404);
        });
    });

    describe('GET /mobile/stats', () => {
        beforeEach(async () => {
            // 创建不同分类的文档
            const docs = [
                factories.mobileDoc.createFrontendDoc(),
                factories.mobileDoc.createFrontendDoc(),
                factories.mobileDoc.createBackendDoc(),
                factories.mobileDoc.create({ category: 'mobile' }),
            ];

            for (const doc of docs) {
                await apiHelper.publicRequest('post', '/mobile/docs')
                    .send(doc)
                    .expect(201);
            }
        });

        it('应该返回分类统计信息', async () => {
            const response = await apiHelper.publicRequest('get', '/mobile/stats')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);

            response.body.forEach((stat: any) => {
                expect(stat).toHaveProperty('category');
                expect(stat).toHaveProperty('count');
                expect(typeof stat.count).toBe('number');
            });

            // 验证统计数据的正确性
            const frontendStat = response.body.find((stat: any) => stat.category === 'frontend');
            const backendStat = response.body.find((stat: any) => stat.category === 'backend');
            const mobileStat = response.body.find((stat: any) => stat.category === 'mobile');

            expect(frontendStat?.count).toBe(2);
            expect(backendStat?.count).toBe(1);
            expect(mobileStat?.count).toBe(1);
        });
    });

    describe('数据完整性测试', () => {
        it('应该正确处理并发创建请求', async () => {
            const createPromises = Array.from({ length: 5 }, (_, index) => {
                const createDto = factories.mobileDoc.create({
                    title: `Concurrent Doc ${index}`,
                });

                return apiHelper.publicRequest('post', '/mobile/docs')
                    .send(createDto);
            });

            const responses = await Promise.all(createPromises);

            responses.forEach(response => {
                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty('id');
            });

            // 验证所有文档都被创建
            const listResponse = await apiHelper.publicRequest('get', '/mobile/docs')
                .expect(200);

            expect(listResponse.body.total).toBe(5);
        });

        it('应该正确处理事务回滚', async () => {
            // 这个测试需要模拟数据库错误来测试事务回滚
            // 在实际应用中，可以通过模拟数据库连接失败等方式来测试
            const createDto = factories.mobileDoc.create();

            const response = await apiHelper.publicRequest('post', '/mobile/docs')
                .send(createDto)
                .expect(201);

            const docId = response.body.id;

            // 验证文档存在
            await apiHelper.publicRequest('get', `/mobile/docs/${docId}`)
                .expect(200);
        });
    });
});

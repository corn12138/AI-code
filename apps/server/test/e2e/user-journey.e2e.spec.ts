import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppModule } from '../../src/app.module';
import { MobileDoc } from '../../src/mobile/entities/mobile-doc.entity';
import { User } from '../../src/user/entities/user.entity';
import { factories } from '../factories';
import { testDatabaseConfig } from '../test-config';
import { ApiTestHelper, DatabaseTestHelper } from '../utils/test-helpers';

describe('User Journey E2E Tests', () => {
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
    });

    describe('新用户完整使用流程', () => {
        it('应该完成从注册到浏览文档的完整流程', async () => {
            // 1. 用户注册
            const registerDto = {
                email: 'newuser@example.com',
                username: 'newuser',
                password: 'Password123!',
            };

            const registerResponse = await apiHelper.publicRequest('post', '/auth/register')
                .send(registerDto)
                .expect(201);

            expect(registerResponse.body).toHaveProperty('access_token');
            expect(registerResponse.body).toHaveProperty('user');

            const { access_token, user } = registerResponse.body;

            // 2. 获取用户资料
            const profileResponse = await apiHelper.authenticatedRequest('get', '/auth/profile', access_token)
                .expect(200);

            expect(profileResponse.body.id).toBe(user.id);
            expect(profileResponse.body.email).toBe(registerDto.email);

            // 3. 创建一些测试文档
            const docs = [
                factories.mobileDoc.createFrontendDoc({ title: 'React 入门指南' }),
                factories.mobileDoc.createBackendDoc({ title: 'Node.js 最佳实践' }),
                factories.mobileDoc.createHotDoc({ title: '2024 前端趋势', isHot: true }),
            ];

            const createdDocs = [];
            for (const doc of docs) {
                const response = await apiHelper.publicRequest('post', '/mobile/docs')
                    .send(doc)
                    .expect(201);
                createdDocs.push(response.body);
            }

            // 4. 浏览文档列表
            const docsListResponse = await apiHelper.publicRequest('get', '/mobile/docs')
                .query({ page: 1, pageSize: 10 })
                .expect(200);

            expect(docsListResponse.body.items).toHaveLength(3);
            expect(docsListResponse.body.total).toBe(3);

            // 5. 按分类筛选文档
            const frontendDocsResponse = await apiHelper.publicRequest('get', '/mobile/docs')
                .query({ category: 'frontend' })
                .expect(200);

            expect(frontendDocsResponse.body.items).toHaveLength(2); // React 入门指南 + 热门文档
            frontendDocsResponse.body.items.forEach((doc: any) => {
                expect(['frontend'].includes(doc.category) || doc.isHot).toBe(true);
            });

            // 6. 搜索文档
            const searchResponse = await apiHelper.publicRequest('get', '/mobile/docs')
                .query({ search: 'React' })
                .expect(200);

            expect(searchResponse.body.items.length).toBeGreaterThan(0);
            const reactDoc = searchResponse.body.items.find((doc: any) =>
                doc.title.includes('React')
            );
            expect(reactDoc).toBeDefined();

            // 7. 查看文档详情
            const docDetailResponse = await apiHelper.publicRequest('get', `/mobile/docs/${reactDoc.id}`)
                .expect(200);

            expect(docDetailResponse.body.id).toBe(reactDoc.id);
            expect(docDetailResponse.body.title).toBe(reactDoc.title);
            expect(docDetailResponse.body).toHaveProperty('content');

            // 8. 获取热门文档
            const hotDocsResponse = await apiHelper.publicRequest('get', '/mobile/docs/hot')
                .expect(200);

            expect(hotDocsResponse.body.length).toBeGreaterThan(0);
            const hotDoc = hotDocsResponse.body.find((doc: any) => doc.isHot);
            expect(hotDoc).toBeDefined();

            // 9. 获取相关文档
            const relatedDocsResponse = await apiHelper.publicRequest('get', `/mobile/docs/${reactDoc.id}/related`)
                .expect(200);

            expect(Array.isArray(relatedDocsResponse.body)).toBe(true);

            // 10. 获取统计信息
            const statsResponse = await apiHelper.publicRequest('get', '/mobile/stats')
                .expect(200);

            expect(Array.isArray(statsResponse.body)).toBe(true);
            expect(statsResponse.body.length).toBeGreaterThan(0);

            const frontendStats = statsResponse.body.find((stat: any) => stat.category === 'frontend');
            expect(frontendStats).toBeDefined();
            expect(frontendStats.count).toBeGreaterThan(0);

            // 11. 用户登出
            const logoutResponse = await apiHelper.publicRequest('post', '/auth/logout')
                .expect(200);

            expect(logoutResponse.body.message).toBe('Successfully logged out');

            // 12. 重新登录
            const loginDto = {
                email: registerDto.email,
                password: registerDto.password,
            };

            const loginResponse = await apiHelper.publicRequest('post', '/auth/login')
                .send(loginDto)
                .expect(200);

            expect(loginResponse.body).toHaveProperty('access_token');
            expect(loginResponse.body.user.id).toBe(user.id);

            // 13. 验证登录后仍能访问资源
            const finalProfileResponse = await apiHelper.authenticatedRequest('get', '/auth/profile', loginResponse.body.access_token)
                .expect(200);

            expect(finalProfileResponse.body.id).toBe(user.id);
        });
    });

    describe('内容管理员工作流程', () => {
        it('应该完成内容创建和管理的完整流程', async () => {
            // 1. 管理员注册
            const adminDto = {
                email: 'admin@example.com',
                username: 'admin',
                password: 'AdminPassword123!',
            };

            const adminRegisterResponse = await apiHelper.publicRequest('post', '/auth/register')
                .send(adminDto)
                .expect(201);

            const { access_token: adminToken } = adminRegisterResponse.body;

            // 2. 创建多个文档
            const docTemplates = [
                { title: 'JavaScript 基础', category: 'frontend', tags: ['javascript', 'basics'] },
                { title: 'React Hooks 详解', category: 'frontend', tags: ['react', 'hooks'] },
                { title: 'Node.js 性能优化', category: 'backend', tags: ['nodejs', 'performance'] },
                { title: 'TypeScript 进阶', category: 'frontend', tags: ['typescript', 'advanced'] },
                { title: 'Docker 容器化', category: 'devops', tags: ['docker', 'containers'] },
            ];

            const createdDocs = [];
            for (const template of docTemplates) {
                const doc = factories.mobileDoc.create({
                    ...template,
                    author: 'Admin User',
                    content: `这是关于 ${template.title} 的详细内容...`,
                    summary: `${template.title} 的简要介绍`,
                });

                const response = await apiHelper.publicRequest('post', '/mobile/docs')
                    .send(doc)
                    .expect(201);

                createdDocs.push(response.body);
            }

            // 3. 验证文档创建成功
            const allDocsResponse = await apiHelper.publicRequest('get', '/mobile/docs')
                .query({ pageSize: 10 })
                .expect(200);

            expect(allDocsResponse.body.total).toBe(5);
            expect(allDocsResponse.body.items).toHaveLength(5);

            // 4. 更新文档内容
            const docToUpdate = createdDocs[0];
            const updateDto = {
                title: 'JavaScript 基础 - 更新版',
                content: '这是更新后的内容...',
                isHot: true,
            };

            const updateResponse = await apiHelper.publicRequest('put', `/mobile/docs/${docToUpdate.id}`)
                .send(updateDto)
                .expect(200);

            expect(updateResponse.body.title).toBe(updateDto.title);
            expect(updateResponse.body.isHot).toBe(true);

            // 5. 验证更新后的文档
            const updatedDocResponse = await apiHelper.publicRequest('get', `/mobile/docs/${docToUpdate.id}`)
                .expect(200);

            expect(updatedDocResponse.body.title).toBe(updateDto.title);
            expect(updatedDocResponse.body.content).toBe(updateDto.content);
            expect(updatedDocResponse.body.isHot).toBe(true);

            // 6. 检查热门文档列表
            const hotDocsResponse = await apiHelper.publicRequest('get', '/mobile/docs/hot')
                .expect(200);

            const updatedHotDoc = hotDocsResponse.body.find((doc: any) => doc.id === docToUpdate.id);
            expect(updatedHotDoc).toBeDefined();
            expect(updatedHotDoc.isHot).toBe(true);

            // 7. 按不同分类查看文档
            const categories = ['frontend', 'backend', 'devops'];
            for (const category of categories) {
                const categoryResponse = await apiHelper.publicRequest('get', '/mobile/docs')
                    .query({ category })
                    .expect(200);

                expect(categoryResponse.body.items.length).toBeGreaterThan(0);
                categoryResponse.body.items.forEach((doc: any) => {
                    expect(doc.category).toBe(category);
                });
            }

            // 8. 测试搜索功能
            const searchTerms = ['JavaScript', 'React', 'Node.js'];
            for (const term of searchTerms) {
                const searchResponse = await apiHelper.publicRequest('get', '/mobile/docs')
                    .query({ search: term })
                    .expect(200);

                if (searchResponse.body.items.length > 0) {
                    const foundDoc = searchResponse.body.items.some((doc: any) =>
                        doc.title.includes(term) ||
                        doc.content.includes(term) ||
                        doc.summary?.includes(term)
                    );
                    expect(foundDoc).toBe(true);
                }
            }

            // 9. 获取统计信息并验证
            const statsResponse = await apiHelper.publicRequest('get', '/mobile/stats')
                .expect(200);

            expect(Array.isArray(statsResponse.body)).toBe(true);

            const frontendStats = statsResponse.body.find((stat: any) => stat.category === 'frontend');
            const backendStats = statsResponse.body.find((stat: any) => stat.category === 'backend');
            const devopsStats = statsResponse.body.find((stat: any) => stat.category === 'devops');

            expect(frontendStats?.count).toBe(3); // JavaScript, React, TypeScript
            expect(backendStats?.count).toBe(1);  // Node.js
            expect(devopsStats?.count).toBe(1);   // Docker

            // 10. 删除一个文档
            const docToDelete = createdDocs[createdDocs.length - 1];
            await apiHelper.publicRequest('delete', `/mobile/docs/${docToDelete.id}`)
                .expect(200);

            // 11. 验证文档已删除
            await apiHelper.publicRequest('get', `/mobile/docs/${docToDelete.id}`)
                .expect(404);

            // 12. 验证总数减少
            const finalDocsResponse = await apiHelper.publicRequest('get', '/mobile/docs')
                .expect(200);

            expect(finalDocsResponse.body.total).toBe(4);
        });
    });

    describe('多用户协作场景', () => {
        it('应该支持多个用户同时操作', async () => {
            // 1. 创建多个用户
            const users = [
                { email: 'user1@example.com', username: 'user1', password: 'Password123!' },
                { email: 'user2@example.com', username: 'user2', password: 'Password123!' },
                { email: 'user3@example.com', username: 'user3', password: 'Password123!' },
            ];

            const userTokens = [];
            for (const userData of users) {
                const response = await apiHelper.publicRequest('post', '/auth/register')
                    .send(userData)
                    .expect(201);
                userTokens.push(response.body.access_token);
            }

            // 2. 每个用户创建文档
            const docPromises = userTokens.map((token, index) => {
                const doc = factories.mobileDoc.create({
                    title: `User ${index + 1} Document`,
                    author: `User ${index + 1}`,
                    category: 'frontend',
                });

                return apiHelper.publicRequest('post', '/mobile/docs')
                    .send(doc);
            });

            const docResponses = await Promise.all(docPromises);
            docResponses.forEach(response => {
                expect(response.status).toBe(201);
            });

            // 3. 验证所有文档都创建成功
            const allDocsResponse = await apiHelper.publicRequest('get', '/mobile/docs')
                .expect(200);

            expect(allDocsResponse.body.total).toBe(3);

            // 4. 每个用户同时查看文档列表
            const viewPromises = userTokens.map(() =>
                apiHelper.publicRequest('get', '/mobile/docs')
                    .query({ page: 1, pageSize: 10 })
            );

            const viewResponses = await Promise.all(viewPromises);
            viewResponses.forEach(response => {
                expect(response.status).toBe(200);
                expect(response.body.total).toBe(3);
            });

            // 5. 用户同时搜索文档
            const searchPromises = userTokens.map((token, index) =>
                apiHelper.publicRequest('get', '/mobile/docs')
                    .query({ search: `User ${index + 1}` })
            );

            const searchResponses = await Promise.all(searchPromises);
            searchResponses.forEach((response, index) => {
                expect(response.status).toBe(200);
                expect(response.body.items.length).toBeGreaterThan(0);

                const userDoc = response.body.items.find((doc: any) =>
                    doc.title.includes(`User ${index + 1}`)
                );
                expect(userDoc).toBeDefined();
            });

            // 6. 用户同时获取统计信息
            const statsPromises = userTokens.map(() =>
                apiHelper.publicRequest('get', '/mobile/stats')
            );

            const statsResponses = await Promise.all(statsPromises);
            statsResponses.forEach(response => {
                expect(response.status).toBe(200);
                expect(Array.isArray(response.body)).toBe(true);
            });
        });
    });

    describe('错误恢复场景', () => {
        it('应该正确处理各种错误情况', async () => {
            // 1. 尝试访问不存在的文档
            const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';
            await apiHelper.publicRequest('get', `/mobile/docs/${nonExistentId}`)
                .expect(404);

            // 2. 尝试更新不存在的文档
            await apiHelper.publicRequest('put', `/mobile/docs/${nonExistentId}`)
                .send({ title: 'Updated Title' })
                .expect(404);

            // 3. 尝试删除不存在的文档
            await apiHelper.publicRequest('delete', `/mobile/docs/${nonExistentId}`)
                .expect(404);

            // 4. 创建有效文档
            const validDoc = factories.mobileDoc.create();
            const createResponse = await apiHelper.publicRequest('post', '/mobile/docs')
                .send(validDoc)
                .expect(201);

            const docId = createResponse.body.id;

            // 5. 尝试用无效数据更新文档
            await apiHelper.publicRequest('put', `/mobile/docs/${docId}`)
                .send({ category: 'invalid-category' })
                .expect(400);

            // 6. 验证文档仍然存在且未被破坏
            const docResponse = await apiHelper.publicRequest('get', `/mobile/docs/${docId}`)
                .expect(200);

            expect(docResponse.body.title).toBe(validDoc.title);
            expect(docResponse.body.category).toBe(validDoc.category);

            // 7. 测试分页边界情况
            await apiHelper.publicRequest('get', '/mobile/docs')
                .query({ page: 0, pageSize: -1 })
                .expect(200); // 应该使用默认值

            await apiHelper.publicRequest('get', '/mobile/docs')
                .query({ page: 999, pageSize: 1000 })
                .expect(200); // 应该返回空结果

            // 8. 测试搜索边界情况
            await apiHelper.publicRequest('get', '/mobile/docs')
                .query({ search: '' })
                .expect(200);

            await apiHelper.publicRequest('get', '/mobile/docs')
                .query({ search: 'nonexistentterm12345' })
                .expect(200); // 应该返回空结果

            // 9. 测试认证错误恢复
            await apiHelper.authenticatedRequest('get', '/auth/profile', 'invalid-token')
                .expect(401);

            // 10. 注册用户并验证系统仍正常工作
            const userDto = {
                email: 'recovery@example.com',
                username: 'recovery',
                password: 'Password123!',
            };

            const registerResponse = await apiHelper.publicRequest('post', '/auth/register')
                .send(userDto)
                .expect(201);

            const { access_token } = registerResponse.body;

            // 11. 验证新用户可以正常访问资源
            await apiHelper.authenticatedRequest('get', '/auth/profile', access_token)
                .expect(200);

            const docsResponse = await apiHelper.publicRequest('get', '/mobile/docs')
                .expect(200);

            expect(docsResponse.body.total).toBe(1); // 之前创建的文档仍然存在
        });
    });

    describe('性能和负载测试', () => {
        it('应该在高并发情况下保持稳定', async () => {
            // 1. 创建基础数据
            const docs = Array.from({ length: 10 }, (_, i) =>
                factories.mobileDoc.create({
                    title: `Performance Test Doc ${i + 1}`,
                    category: i % 2 === 0 ? 'frontend' : 'backend',
                })
            );

            const createPromises = docs.map(doc =>
                apiHelper.publicRequest('post', '/mobile/docs').send(doc)
            );

            const createResponses = await Promise.all(createPromises);
            createResponses.forEach(response => {
                expect(response.status).toBe(201);
            });

            // 2. 并发读取测试
            const readPromises = Array.from({ length: 20 }, () =>
                apiHelper.publicRequest('get', '/mobile/docs')
                    .query({ page: 1, pageSize: 5 })
            );

            const startTime = Date.now();
            const readResponses = await Promise.all(readPromises);
            const endTime = Date.now();

            readResponses.forEach(response => {
                expect(response.status).toBe(200);
                expect(response.body.items).toHaveLength(5);
            });

            // 响应时间应该在合理范围内
            const totalTime = endTime - startTime;
            expect(totalTime).toBeLessThan(5000); // 5秒内完成

            // 3. 并发搜索测试
            const searchTerms = ['Performance', 'Test', 'Doc', 'frontend', 'backend'];
            const searchPromises = searchTerms.flatMap(term =>
                Array.from({ length: 4 }, () =>
                    apiHelper.publicRequest('get', '/mobile/docs')
                        .query({ search: term })
                )
            );

            const searchResponses = await Promise.all(searchPromises);
            searchResponses.forEach(response => {
                expect(response.status).toBe(200);
            });

            // 4. 并发统计查询测试
            const statsPromises = Array.from({ length: 10 }, () =>
                apiHelper.publicRequest('get', '/mobile/stats')
            );

            const statsResponses = await Promise.all(statsPromises);
            statsResponses.forEach(response => {
                expect(response.status).toBe(200);
                expect(Array.isArray(response.body)).toBe(true);
            });
        });
    });
});

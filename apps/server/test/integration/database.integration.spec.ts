import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { MobileDoc } from '../../src/mobile/entities/mobile-doc.entity';
import { MobileModule } from '../../src/mobile/mobile.module';
import { User } from '../../src/user/entities/user.entity';
import { UserModule } from '../../src/user/user.module';
import { factories } from '../factories';
import { createMockRepository } from '../utils/test-helpers';

describe('Database Integration Tests', () => {
    let app: INestApplication;
    let moduleRef: TestingModule;
    let mockUserRepository: ReturnType<typeof createMockRepository>;
    let mockMobileDocRepository: ReturnType<typeof createMockRepository>;

    beforeAll(async () => {
        mockUserRepository = createMockRepository<User>();
        mockMobileDocRepository = createMockRepository<MobileDoc>();

        moduleRef = await Test.createTestingModule({
            imports: [
                UserModule,
                MobileModule,
            ],
            providers: [
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: getRepositoryToken(MobileDoc),
                    useValue: mockMobileDocRepository,
                },
                {
                    provide: getDataSourceToken(),
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

    describe('数据库连接和基本操作', () => {
        it('应该成功连接到数据库', async () => {
            const dataSource = moduleRef.get<DataSource>(DataSource);
            expect(dataSource.isInitialized).toBe(true);

            // 测试简单查询
            const result = await dataSource.query('SELECT 1 as test');
            expect(result[0].test).toBe(1);
        });

        it('应该能够创建和查询表', async () => {
            // 检查表是否存在
            const tables = await dataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);

            const tableNames = tables.map((t: any) => t.table_name);
            expect(tableNames).toContain('user');
            expect(tableNames).toContain('mobile_doc');
        });

        it('应该支持事务操作', async () => {
            const queryRunner = dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                // 在事务中创建用户
                const user = factories.user.create();
                await queryRunner.manager.save(User, user);

                // 验证用户存在
                const foundUser = await queryRunner.manager.findOne(User, {
                    where: { email: user.email },
                });
                expect(foundUser).toBeDefined();
                expect(foundUser?.email).toBe(user.email);

                // 回滚事务
                await queryRunner.rollbackTransaction();

                // 验证用户不存在（因为回滚了）
                const userAfterRollback = await dataSource.getRepository(User).findOne({
                    where: { email: user.email },
                });
                expect(userAfterRollback).toBeNull();

            } finally {
                await queryRunner.release();
            }
        });
    });

    describe('用户实体数据库操作', () => {
        it('应该能够创建和查询用户', async () => {
            const userRepo = dataSource.getRepository(User);
            const userData = factories.user.create();

            // 创建用户
            const savedUser = await userRepo.save(userData);
            expect(savedUser.id).toBeDefined();
            expect(savedUser.email).toBe(userData.email);

            // 查询用户
            const foundUser = await userRepo.findOne({
                where: { email: userData.email },
            });
            expect(foundUser).toBeDefined();
            expect(foundUser?.username).toBe(userData.username);
        });

        it('应该强制执行唯一约束', async () => {
            const userRepo = dataSource.getRepository(User);
            const userData = factories.user.create();

            // 创建第一个用户
            await userRepo.save(userData);

            // 尝试创建相同邮箱的用户
            const duplicateUser = factories.user.create({
                email: userData.email, // 相同邮箱
            });

            await expect(userRepo.save(duplicateUser)).rejects.toThrow();
        });

        it('应该支持批量操作', async () => {
            const userRepo = dataSource.getRepository(User);
            const users = factories.user.createMany(5);

            // 批量创建
            const savedUsers = await userRepo.save(users);
            expect(savedUsers).toHaveLength(5);

            // 批量查询
            const allUsers = await userRepo.find();
            expect(allUsers).toHaveLength(5);

            // 批量删除
            await userRepo.remove(savedUsers);
            const remainingUsers = await userRepo.find();
            expect(remainingUsers).toHaveLength(0);
        });

        it('应该支持复杂查询', async () => {
            const userRepo = dataSource.getRepository(User);

            // 创建测试数据
            const users = [
                factories.user.create({ role: 'admin', username: 'admin1' }),
                factories.user.create({ role: 'admin', username: 'admin2' }),
                factories.user.create({ role: 'user', username: 'user1' }),
                factories.user.create({ role: 'user', username: 'user2' }),
                factories.user.create({ role: 'editor', username: 'editor1' }),
            ];

            await userRepo.save(users);

            // 按角色查询
            const admins = await userRepo.find({ where: { role: 'admin' } });
            expect(admins).toHaveLength(2);

            // 使用 QueryBuilder 进行复杂查询
            const usersByRole = await userRepo
                .createQueryBuilder('user')
                .where('user.role IN (:...roles)', { roles: ['admin', 'editor'] })
                .orderBy('user.username', 'ASC')
                .getMany();

            expect(usersByRole).toHaveLength(3);
            expect(usersByRole[0].username).toBe('admin1');
        });
    });

    describe('移动端文档实体数据库操作', () => {
        it('应该能够创建和查询文档', async () => {
            const docRepo = dataSource.getRepository(MobileDoc);
            const docData = factories.mobileDoc.create();

            // 创建文档
            const savedDoc = await docRepo.save(docData);
            expect(savedDoc.id).toBeDefined();
            expect(savedDoc.title).toBe(docData.title);

            // 查询文档
            const foundDoc = await docRepo.findOne({
                where: { title: docData.title },
            });
            expect(foundDoc).toBeDefined();
            expect(foundDoc?.content).toBe(docData.content);
        });

        it('应该支持全文搜索', async () => {
            const docRepo = dataSource.getRepository(MobileDoc);

            const docs = [
                factories.mobileDoc.create({
                    title: 'React 入门教程',
                    content: '这是一个关于 React 的详细教程',
                    category: 'frontend'
                }),
                factories.mobileDoc.create({
                    title: 'Vue.js 指南',
                    content: '学习 Vue.js 框架的基础知识',
                    category: 'frontend'
                }),
                factories.mobileDoc.create({
                    title: 'Node.js 后端开发',
                    content: '使用 Node.js 构建后端应用',
                    category: 'backend'
                }),
            ];

            await docRepo.save(docs);

            // 搜索包含 "React" 的文档
            const reactDocs = await docRepo
                .createQueryBuilder('doc')
                .where('doc.title ILIKE :search OR doc.content ILIKE :search', {
                    search: '%React%'
                })
                .getMany();

            expect(reactDocs).toHaveLength(1);
            expect(reactDocs[0].title).toContain('React');

            // 搜索前端相关文档
            const frontendDocs = await docRepo
                .createQueryBuilder('doc')
                .where('doc.category = :category', { category: 'frontend' })
                .getMany();

            expect(frontendDocs).toHaveLength(2);
        });

        it('应该支持分页查询', async () => {
            const docRepo = dataSource.getRepository(MobileDoc);

            // 创建20个文档
            const docs = Array.from({ length: 20 }, (_, i) =>
                factories.mobileDoc.create({
                    title: `Document ${i + 1}`,
                    sortOrder: i,
                })
            );

            await docRepo.save(docs);

            // 第一页（前10个）
            const page1 = await docRepo
                .createQueryBuilder('doc')
                .orderBy('doc.sortOrder', 'ASC')
                .take(10)
                .skip(0)
                .getMany();

            expect(page1).toHaveLength(10);
            expect(page1[0].title).toBe('Document 1');

            // 第二页（后10个）
            const page2 = await docRepo
                .createQueryBuilder('doc')
                .orderBy('doc.sortOrder', 'ASC')
                .take(10)
                .skip(10)
                .getMany();

            expect(page2).toHaveLength(10);
            expect(page2[0].title).toBe('Document 11');

            // 获取总数
            const total = await docRepo.count();
            expect(total).toBe(20);
        });

        it('应该支持聚合查询', async () => {
            const docRepo = dataSource.getRepository(MobileDoc);

            const docs = [
                ...Array.from({ length: 5 }, () => factories.mobileDoc.create({ category: 'frontend' })),
                ...Array.from({ length: 3 }, () => factories.mobileDoc.create({ category: 'backend' })),
                ...Array.from({ length: 2 }, () => factories.mobileDoc.create({ category: 'mobile' })),
            ];

            await docRepo.save(docs);

            // 按分类统计
            const stats = await docRepo
                .createQueryBuilder('doc')
                .select('doc.category', 'category')
                .addSelect('COUNT(*)', 'count')
                .groupBy('doc.category')
                .orderBy('count', 'DESC')
                .getRawMany();

            expect(stats).toHaveLength(3);
            expect(stats[0].category).toBe('frontend');
            expect(parseInt(stats[0].count)).toBe(5);
            expect(stats[1].category).toBe('backend');
            expect(parseInt(stats[1].count)).toBe(3);
        });
    });

    describe('数据库性能测试', () => {
        it('应该在大量数据下保持查询性能', async () => {
            const docRepo = dataSource.getRepository(MobileDoc);

            // 创建1000个文档
            const docs = Array.from({ length: 1000 }, (_, i) =>
                factories.mobileDoc.create({
                    title: `Performance Test Doc ${i + 1}`,
                    category: ['frontend', 'backend', 'mobile'][i % 3],
                })
            );

            // 批量插入
            const startInsert = Date.now();
            await docRepo.save(docs, { chunk: 100 }); // 分批插入
            const insertTime = Date.now() - startInsert;

            console.log(`插入1000条记录耗时: ${insertTime}ms`);
            expect(insertTime).toBeLessThan(5000); // 应该在5秒内完成

            // 测试查询性能
            const startQuery = Date.now();
            const results = await docRepo
                .createQueryBuilder('doc')
                .where('doc.category = :category', { category: 'frontend' })
                .orderBy('doc.createdAt', 'DESC')
                .take(50)
                .getMany();
            const queryTime = Date.now() - startQuery;

            console.log(`查询耗时: ${queryTime}ms`);
            expect(queryTime).toBeLessThan(1000); // 查询应该在1秒内完成
            expect(results.length).toBeGreaterThan(0);

            // 测试聚合查询性能
            const startAgg = Date.now();
            const aggResults = await docRepo
                .createQueryBuilder('doc')
                .select('doc.category', 'category')
                .addSelect('COUNT(*)', 'count')
                .groupBy('doc.category')
                .getRawMany();
            const aggTime = Date.now() - startAgg;

            console.log(`聚合查询耗时: ${aggTime}ms`);
            expect(aggTime).toBeLessThan(500); // 聚合查询应该在500ms内完成
            expect(aggResults).toHaveLength(3);
        });

        it('应该支持并发数据库操作', async () => {
            const userRepo = dataSource.getRepository(User);

            // 并发创建用户
            const concurrentOperations = Array.from({ length: 10 }, (_, i) =>
                userRepo.save(factories.user.create({
                    email: `concurrent${i}@example.com`,
                    username: `concurrent${i}`,
                }))
            );

            const startTime = Date.now();
            const results = await Promise.all(concurrentOperations);
            const endTime = Date.now();

            console.log(`并发创建10个用户耗时: ${endTime - startTime}ms`);

            expect(results).toHaveLength(10);
            results.forEach(user => {
                expect(user.id).toBeDefined();
            });

            // 验证所有用户都成功创建
            const totalUsers = await userRepo.count();
            expect(totalUsers).toBe(10);
        });
    });

    describe('数据完整性和约束测试', () => {
        it('应该处理数据库约束违反', async () => {
            const userRepo = dataSource.getRepository(User);

            // 创建用户
            const user = factories.user.create();
            await userRepo.save(user);

            // 尝试创建相同邮箱的用户
            const duplicateUser = factories.user.create({
                email: user.email,
            });

            await expect(userRepo.save(duplicateUser)).rejects.toThrow();
        });

        it('应该正确处理 NULL 值', async () => {
            const docRepo = dataSource.getRepository(MobileDoc);

            // 创建包含可选字段的文档
            const doc = factories.mobileDoc.create({
                summary: null, // 可选字段
                imageUrl: null, // 可选字段
            });

            const savedDoc = await docRepo.save(doc);
            expect(savedDoc.summary).toBeNull();
            expect(savedDoc.imageUrl).toBeNull();
            expect(savedDoc.title).toBeDefined(); // 必填字段应该有值
        });

        it('应该正确处理日期字段', async () => {
            const docRepo = dataSource.getRepository(MobileDoc);

            const now = new Date();
            const doc = factories.mobileDoc.create({
                createdAt: now,
                updatedAt: now,
            });

            const savedDoc = await docRepo.save(doc);

            // 验证日期字段
            expect(savedDoc.createdAt).toBeInstanceOf(Date);
            expect(savedDoc.updatedAt).toBeInstanceOf(Date);

            // 验证日期值（允许小的时间差）
            const timeDiff = Math.abs(savedDoc.createdAt.getTime() - now.getTime());
            expect(timeDiff).toBeLessThan(1000); // 1秒内的差异是可接受的
        });
    });

    describe('数据库清理和重置', () => {
        it('应该能够清空所有表', async () => {
            const userRepo = dataSource.getRepository(User);
            const docRepo = dataSource.getRepository(MobileDoc);

            // 创建一些数据
            await userRepo.save(factories.user.createMany(3));
            await docRepo.save(factories.mobileDoc.createMany(5));

            // 验证数据存在
            expect(await userRepo.count()).toBe(3);
            expect(await docRepo.count()).toBe(5);

            // 清空数据库
            await dbHelper.clearDatabase();

            // 验证数据已清空
            expect(await userRepo.count()).toBe(0);
            expect(await docRepo.count()).toBe(0);
        });

        it('应该能够重置数据库结构', async () => {
            // 这个测试验证数据库结构可以被重置
            // 在实际应用中，这通常通过迁移来处理

            const queryRunner = dataSource.createQueryRunner();

            try {
                // 检查表是否存在
                const tableExists = await queryRunner.hasTable('user');
                expect(tableExists).toBe(true);

                // 在测试环境中，我们可以验证表结构
                const table = await queryRunner.getTable('user');
                expect(table).toBeDefined();
                expect(table?.columns.length).toBeGreaterThan(0);

                // 验证特定列存在
                const emailColumn = table?.columns.find(col => col.name === 'email');
                expect(emailColumn).toBeDefined();
                expect(emailColumn?.isUnique).toBe(true);

            } finally {
                await queryRunner.release();
            }
        });
    });
});

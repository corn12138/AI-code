import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { vi } from 'vitest';
import { jwtTestConfig, testUsers } from '../test-config';

/**
 * 测试应用构建器
 */
export class TestAppBuilder {
    private moduleBuilder: any;
    private entities: any[] = [];
    private providers: any[] = [];
    private controllers: any[] = [];
    private imports: any[] = [];

    constructor() {
        this.moduleBuilder = Test.createTestingModule({});
    }

    /**
     * 添加实体
     */
    withEntities(entities: any[]): TestAppBuilder {
        this.entities = [...this.entities, ...entities];
        return this;
    }

    /**
     * 添加提供者
     */
    withProviders(providers: any[]): TestAppBuilder {
        this.providers = [...this.providers, ...providers];
        return this;
    }

    /**
     * 添加控制器
     */
    withControllers(controllers: any[]): TestAppBuilder {
        this.controllers = [...this.controllers, ...controllers];
        return this;
    }

    /**
     * 添加模块导入
     */
    withImports(imports: any[]): TestAppBuilder {
        this.imports = [...this.imports, ...imports];
        return this;
    }

    /**
     * 添加 Mock 仓库
     */
    withMockRepositories(entities: any[]): TestAppBuilder {
        const mockRepositories = entities.map(entity => ({
            provide: getRepositoryToken(entity),
            useValue: createMockRepository(),
        }));
        this.providers = [...this.providers, ...mockRepositories];
        return this;
    }

    /**
     * 构建测试模块
     */
    async build(): Promise<TestingModule> {
        return this.moduleBuilder
            .setMetadata('imports', this.imports)
            .setMetadata('controllers', this.controllers)
            .setMetadata('providers', this.providers)
            .compile();
    }

    /**
     * 构建测试应用
     */
    async buildApp(): Promise<INestApplication> {
        const module = await this.build();
        const app = module.createNestApplication();
        await app.init();
        return app;
    }
}

/**
 * 创建 Mock 仓库
 */
export function createMockRepository<T = any>(): Partial<Repository<T>> {
    return {
        find: vi.fn(),
        findOne: vi.fn(),
        findOneBy: vi.fn(),
        findAndCount: vi.fn(),
        create: vi.fn(),
        save: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        remove: vi.fn(),
        count: vi.fn(),
        query: vi.fn(),
        createQueryBuilder: vi.fn(() => {
            const queryBuilder = {
                select: vi.fn(),
                addSelect: vi.fn(),
                where: vi.fn(),
                andWhere: vi.fn(),
                orWhere: vi.fn(),
                orderBy: vi.fn(),
                addOrderBy: vi.fn(),
                groupBy: vi.fn(),
                having: vi.fn(),
                limit: vi.fn(),
                offset: vi.fn(),
                take: vi.fn(),
                skip: vi.fn(),
                leftJoin: vi.fn(),
                innerJoin: vi.fn(),
                getOne: vi.fn(),
                getMany: vi.fn(),
                getManyAndCount: vi.fn(),
                getRawMany: vi.fn(),
                getRawOne: vi.fn(),
                execute: vi.fn(),
            };

            // 设置所有方法都返回 queryBuilder 本身以支持链式调用
            Object.keys(queryBuilder).forEach(key => {
                if (typeof queryBuilder[key] === 'function' && !['getOne', 'getMany', 'getManyAndCount', 'getRawMany', 'getRawOne', 'execute'].includes(key)) {
                    queryBuilder[key].mockReturnValue(queryBuilder);
                }
            });

            return queryBuilder;
        }),
    };
}

/**
 * 创建 Mock 数据源
 */
export function createMockDataSource(): Partial<DataSource> {
    return {
        getRepository: vi.fn(),
        createQueryRunner: vi.fn(() => ({
            connect: vi.fn(),
            startTransaction: vi.fn(),
            commitTransaction: vi.fn(),
            rollbackTransaction: vi.fn(),
            release: vi.fn(),
            manager: {
                save: vi.fn(),
                remove: vi.fn(),
                find: vi.fn(),
                findOne: vi.fn(),
            },
        })),
        transaction: vi.fn(),
        query: vi.fn(),
        manager: {
            save: vi.fn(),
            remove: vi.fn(),
            find: vi.fn(),
            findOne: vi.fn(),
            getRepository: vi.fn(),
        },
    };
}

/**
 * JWT 测试工具
 */
export class JwtTestHelper {
    private jwtService: JwtService;

    constructor() {
        this.jwtService = new JwtService(jwtTestConfig);
    }

    /**
     * 生成测试 JWT Token
     */
    generateToken(payload: any = testUsers.user): string {
        return this.jwtService.sign({
            sub: payload.id,
            email: payload.email,
            username: payload.username,
            role: payload.role,
        });
    }

    /**
     * 生成管理员 Token
     */
    generateAdminToken(): string {
        return this.generateToken(testUsers.admin);
    }

    /**
     * 生成普通用户 Token
     */
    generateUserToken(): string {
        return this.generateToken(testUsers.user);
    }

    /**
     * 生成编辑者 Token
     */
    generateEditorToken(): string {
        return this.generateToken(testUsers.editor);
    }

    /**
     * 验证 Token
     */
    verifyToken(token: string): any {
        return this.jwtService.verify(token);
    }
}

/**
 * API 测试工具
 */
export class ApiTestHelper {
    private app: INestApplication;
    private jwtHelper: JwtTestHelper;

    constructor(app: INestApplication) {
        this.app = app;
        this.jwtHelper = new JwtTestHelper();
    }

    /**
     * 发送认证请求
     */
    authenticatedRequest(method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string, token?: string) {
        const authToken = token || this.jwtHelper.generateUserToken();
        return request(this.app.getHttpServer())
        [method](url)
            .set('Authorization', `Bearer ${authToken}`);
    }

    /**
     * 发送管理员请求
     */
    adminRequest(method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string) {
        return this.authenticatedRequest(method, url, this.jwtHelper.generateAdminToken());
    }

    /**
     * 发送普通用户请求
     */
    userRequest(method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string) {
        return this.authenticatedRequest(method, url, this.jwtHelper.generateUserToken());
    }

    /**
     * 发送未认证请求
     */
    publicRequest(method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string) {
        return request(this.app.getHttpServer())[method](url);
    }

    /**
     * 登录并获取 Token
     */
    async login(credentials: { email: string; password: string }): Promise<string> {
        const response = await this.publicRequest('post', '/auth/login')
            .send(credentials)
            .expect(200);

        return response.body.access_token;
    }

    /**
     * 注册新用户
     */
    async register(userData: any): Promise<any> {
        const response = await this.publicRequest('post', '/auth/register')
            .send(userData)
            .expect(201);

        return response.body;
    }
}

/**
 * 数据库测试工具
 */
export class DatabaseTestHelper {
    private dataSource: DataSource;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
    }

    /**
     * 清空所有表
     */
    async clearDatabase(): Promise<void> {
        const entities = this.dataSource.entityMetadatas;

        for (const entity of entities) {
            const repository = this.dataSource.getRepository(entity.name);
            await repository.clear();
        }
    }

    /**
     * 插入测试数据
     */
    async seedTestData(): Promise<void> {
        // 这里可以插入基础测试数据
        // 例如：用户、角色、基础配置等
    }

    /**
     * 执行原始 SQL
     */
    async executeRawSql(sql: string, parameters?: any[]): Promise<any> {
        return this.dataSource.query(sql, parameters);
    }

    /**
     * 获取仓库
     */
    getRepository<T>(entity: any): Repository<T> {
        return this.dataSource.getRepository(entity);
    }
}

/**
 * 性能测试工具
 */
export class PerformanceTestHelper {
    /**
     * 测量函数执行时间
     */
    static async measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
        const start = process.hrtime.bigint();
        const result = await fn();
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000; // 转换为毫秒

        return { result, duration };
    }

    /**
     * 并发测试
     */
    static async concurrentTest<T>(
        fn: () => Promise<T>,
        concurrency: number,
        iterations: number
    ): Promise<{ results: T[]; totalDuration: number; averageDuration: number }> {
        const start = process.hrtime.bigint();
        const promises: Promise<T>[] = [];

        for (let i = 0; i < iterations; i++) {
            promises.push(fn());

            // 控制并发数
            if (promises.length >= concurrency) {
                await Promise.all(promises.splice(0, concurrency));
            }
        }

        // 等待剩余的 Promise
        const results = await Promise.all(promises);

        const end = process.hrtime.bigint();
        const totalDuration = Number(end - start) / 1000000;
        const averageDuration = totalDuration / iterations;

        return { results, totalDuration, averageDuration };
    }
}

/**
 * Mock 数据生成器
 */
export class MockDataGenerator {
    /**
     * 生成 Mock 用户
     */
    static generateUser(overrides: Partial<any> = {}): any {
        return {
            id: `user-${Date.now()}-${Math.random()}`,
            email: `test${Date.now()}@example.com`,
            username: `user${Date.now()}`,
            password: 'Test123!',
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        };
    }

    /**
     * 生成 Mock 文章
     */
    static generateArticle(overrides: Partial<any> = {}): any {
        return {
            id: `article-${Date.now()}-${Math.random()}`,
            title: `Test Article ${Date.now()}`,
            content: 'This is test article content.',
            summary: 'Test article summary',
            status: 'published',
            authorId: 'test-author-id',
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        };
    }

    /**
     * 生成 Mock 标签
     */
    static generateTag(overrides: Partial<any> = {}): any {
        return {
            id: `tag-${Date.now()}-${Math.random()}`,
            name: `Tag ${Date.now()}`,
            slug: `tag-${Date.now()}`,
            description: 'Test tag description',
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        };
    }
}

/**
 * 测试断言工具
 */
export class TestAssertions {
    /**
     * 断言 API 响应结构
     */
    static assertApiResponse(response: any, expectedStructure: any): void {
        expect(response).toBeDefined();
        expect(response.status).toBeDefined();

        if (expectedStructure.data) {
            expect(response.body.data).toBeDefined();
        }

        if (expectedStructure.message) {
            expect(response.body.message).toBeDefined();
        }

        if (expectedStructure.error) {
            expect(response.body.error).toBeDefined();
        }
    }

    /**
     * 断言分页响应
     */
    static assertPaginatedResponse(response: any): void {
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('page');
        expect(response.body).toHaveProperty('pageSize');
        expect(response.body).toHaveProperty('hasMore');

        expect(Array.isArray(response.body.data)).toBe(true);
        expect(typeof response.body.total).toBe('number');
        expect(typeof response.body.page).toBe('number');
        expect(typeof response.body.pageSize).toBe('number');
        expect(typeof response.body.hasMore).toBe('boolean');
    }

    /**
     * 断言实体结构
     */
    static assertEntityStructure(entity: any, expectedFields: string[]): void {
        expect(entity).toBeDefined();

        expectedFields.forEach(field => {
            expect(entity).toHaveProperty(field);
        });
    }
}

// 导出所有工具 (避免重复导出)
// export {
//     ApiTestHelper,
//     DatabaseTestHelper, JwtTestHelper, MockDataGenerator, PerformanceTestHelper, TestAppBuilder, TestAssertions
// };


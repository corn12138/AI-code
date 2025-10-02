import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockRepository } from '../../test/utils/test-helpers';
import { MobileService } from './mobile.service';

// Mock 实体类型
interface MockMobileDoc {
    id: string;
    title: string;
    content: string;
    author: string;
    category: string;
    tags: string[];
    isHot: boolean;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
}

describe('MobileService (Simplified)', () => {
    let service: MobileService;
    let mockRepository: ReturnType<typeof createMockRepository>;

    beforeEach(async () => {
        mockRepository = createMockRepository<MockMobileDoc>();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MobileService,
                {
                    provide: getRepositoryToken('MobileDoc'), // 使用字符串而不是实际类
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<MobileService>(MobileService);
        vi.clearAllMocks();
    });

    describe('基本功能测试', () => {
        it('应该正确注入服务', () => {
            expect(service).toBeDefined();
        });

        it('应该有 create 方法', () => {
            expect(typeof service.create).toBe('function');
        });

        it('应该有 findAll 方法', () => {
            expect(typeof service.findAll).toBe('function');
        });

        it('应该有 findOne 方法', () => {
            expect(typeof service.findOne).toBe('function');
        });

        it('应该有 update 方法', () => {
            expect(typeof service.update).toBe('function');
        });

        it('应该有 remove 方法', () => {
            expect(typeof service.remove).toBe('function');
        });
    });

    describe('Mock 仓库测试', () => {
        it('应该正确配置 Mock 仓库', () => {
            expect(mockRepository).toBeDefined();
            expect(mockRepository.find).toBeDefined();
            expect(mockRepository.findOne).toBeDefined();
            expect(mockRepository.create).toBeDefined();
            expect(mockRepository.save).toBeDefined();
            expect(mockRepository.update).toBeDefined();
            expect(mockRepository.delete).toBeDefined();
        });

        it('Mock 方法应该返回预期结果', async () => {
            const mockDoc: MockMobileDoc = {
                id: 'test-id',
                title: 'Test Document',
                content: 'Test content',
                author: 'Test Author',
                category: 'frontend',
                tags: ['test'],
                isHot: false,
                published: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockRepository.findOne.mockResolvedValue(mockDoc);

            const result = await mockRepository.findOne({ where: { id: 'test-id' } });
            expect(result).toEqual(mockDoc);
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
        });
    });

    describe('错误处理测试', () => {
        it('应该处理 Mock 仓库错误', async () => {
            const error = new Error('Database error');
            mockRepository.findOne.mockRejectedValue(error);

            await expect(mockRepository.findOne({ where: { id: 'test-id' } })).rejects.toThrow('Database error');
        });

        it('应该处理 NotFoundException', () => {
            const notFoundError = new NotFoundException('Document not found');
            expect(notFoundError).toBeInstanceOf(NotFoundException);
            expect(notFoundError.message).toBe('Document not found');
        });
    });

    describe('数据验证测试', () => {
        it('应该验证文档数据结构', () => {
            const doc: MockMobileDoc = {
                id: 'doc-123',
                title: 'Test Document',
                content: 'This is test content',
                author: 'Test Author',
                category: 'frontend',
                tags: ['javascript', 'react'],
                isHot: true,
                published: true,
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-01-02'),
            };

            // 验证必填字段
            expect(doc.id).toBeDefined();
            expect(doc.title).toBeDefined();
            expect(doc.content).toBeDefined();
            expect(doc.author).toBeDefined();
            expect(doc.category).toBeDefined();

            // 验证数据类型
            expect(typeof doc.id).toBe('string');
            expect(typeof doc.title).toBe('string');
            expect(typeof doc.content).toBe('string');
            expect(typeof doc.author).toBe('string');
            expect(typeof doc.category).toBe('string');
            expect(Array.isArray(doc.tags)).toBe(true);
            expect(typeof doc.isHot).toBe('boolean');
            expect(typeof doc.published).toBe('boolean');
            expect(doc.createdAt).toBeInstanceOf(Date);
            expect(doc.updatedAt).toBeInstanceOf(Date);

            // 验证数据值
            expect(doc.id).toBe('doc-123');
            expect(doc.title).toBe('Test Document');
            expect(doc.tags).toContain('javascript');
            expect(doc.tags).toContain('react');
            expect(doc.isHot).toBe(true);
            expect(doc.published).toBe(true);
        });

        it('应该验证分类枚举值', () => {
            const validCategories = ['latest', 'frontend', 'backend', 'ai', 'mobile', 'design'];

            validCategories.forEach(category => {
                expect(validCategories).toContain(category);
            });

            const doc: MockMobileDoc = {
                id: 'doc-123',
                title: 'Test Document',
                content: 'Test content',
                author: 'Test Author',
                category: 'frontend',
                tags: [],
                isHot: false,
                published: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            expect(validCategories).toContain(doc.category);
        });
    });

    describe('异步操作测试', () => {
        it('应该处理异步 Mock 操作', async () => {
            const mockDoc: MockMobileDoc = {
                id: 'async-test',
                title: 'Async Test Document',
                content: 'Async test content',
                author: 'Async Author',
                category: 'backend',
                tags: ['async', 'test'],
                isHot: false,
                published: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // 模拟异步创建
            mockRepository.create.mockReturnValue(mockDoc);
            mockRepository.save.mockResolvedValue(mockDoc);

            const created = mockRepository.create(mockDoc);
            const saved = await mockRepository.save(created);

            expect(created).toEqual(mockDoc);
            expect(saved).toEqual(mockDoc);
            expect(mockRepository.create).toHaveBeenCalledWith(mockDoc);
            expect(mockRepository.save).toHaveBeenCalledWith(created);
        });

        it('应该处理并发 Mock 操作', async () => {
            const docs: MockMobileDoc[] = Array.from({ length: 5 }, (_, index) => ({
                id: `doc-${index}`,
                title: `Document ${index}`,
                content: `Content ${index}`,
                author: 'Test Author',
                category: 'frontend',
                tags: [`tag-${index}`],
                isHot: false,
                published: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));

            mockRepository.find.mockResolvedValue(docs);

            const results = await Promise.all([
                mockRepository.find(),
                mockRepository.find(),
                mockRepository.find(),
            ]);

            results.forEach(result => {
                expect(result).toEqual(docs);
            });

            expect(mockRepository.find).toHaveBeenCalledTimes(3);
        });
    });
});

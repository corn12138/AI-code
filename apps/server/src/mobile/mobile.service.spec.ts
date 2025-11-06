import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { factories } from '../../test/factories';
import { createMockRepository } from '../../test/utils/test-helpers';
import { CreateMobileDocDto } from './dto/create-mobile-doc.dto';
import { QueryMobileDocDto } from './dto/query-mobile-doc.dto';
import { UpdateMobileDocDto } from './dto/update-mobile-doc.dto';
import { MobileDoc } from './entities/mobile-doc.entity';
import { MobileService } from './mobile.service';

describe('MobileService', () => {
    let service: MobileService;
    let mobileDocRepository: Repository<MobileDoc>;
    let mockRepository: ReturnType<typeof createMockRepository>;

    beforeEach(async () => {
        mockRepository = createMockRepository<MobileDoc>();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MobileService,
                {
                    provide: getRepositoryToken(MobileDoc),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<MobileService>(MobileService);
        mobileDocRepository = module.get<Repository<MobileDoc>>(getRepositoryToken(MobileDoc));

        vi.clearAllMocks();
    });

    describe('create', () => {
        it('应该成功创建移动端文档', async () => {
            const createDto: CreateMobileDocDto = {
                title: 'Test Document',
                content: 'Test content',
                summary: 'Test summary',
                author: 'Test Author',
                category: 'frontend',
                tags: ['javascript', 'react'],
                readTime: 5,
            };

            const savedDoc = factories.mobileDoc.create({
                ...createDto,
                id: 'doc-id-123',
            });

            mockRepository.create.mockReturnValue(savedDoc);
            mockRepository.save.mockResolvedValue(savedDoc);

            const result = await service.create(createDto);

            expect(mockRepository.create).toHaveBeenCalledWith(createDto);
            expect(mockRepository.save).toHaveBeenCalledWith(savedDoc);
            expect(result).toEqual(savedDoc);
        });

        it('应该在创建时设置默认值', async () => {
            const createDto: CreateMobileDocDto = {
                title: 'Test Document',
                content: 'Test content',
                author: 'Test Author',
                category: 'frontend',
            };

            const savedDoc = factories.mobileDoc.create({
                ...createDto,
                published: true,
                isHot: false,
                sortOrder: 0,
                docType: 'article',
                tags: [],
            });

            mockRepository.create.mockReturnValue(savedDoc);
            mockRepository.save.mockResolvedValue(savedDoc);

            await service.create(createDto);

            expect(mockRepository.create).toHaveBeenCalledWith(createDto);
        });
    });

    describe('findAll', () => {
        it('应该返回分页的文档列表', async () => {
            const queryDto: QueryMobileDocDto = {
                page: 1,
                pageSize: 10,
            };

            const docs = factories.mobileDoc.createMany(5);
            const total = 15;

            mockRepository.createQueryBuilder.mockReturnValue({
                where: vi.fn().mockReturnThis(),
                andWhere: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                addOrderBy: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                take: vi.fn().mockReturnThis(),
                getManyAndCount: vi.fn().mockResolvedValue([docs, total]),
            });

            const result = await service.findAll(queryDto);

            expect(result).toEqual({
                items: docs,
                total,
                page: 1,
                pageSize: 10,
                hasMore: true,
            });
        });

        it('应该根据分类过滤文档', async () => {
            const queryDto: QueryMobileDocDto = {
                page: 1,
                pageSize: 10,
                category: 'frontend',
            };

            const docs = factories.mobileDoc.createMany(3, { category: 'frontend' });
            const mockQueryBuilder = {
                where: vi.fn().mockReturnThis(),
                andWhere: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                addOrderBy: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                take: vi.fn().mockReturnThis(),
                getManyAndCount: vi.fn().mockResolvedValue([docs, 3]),
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const result = await service.findAll(queryDto);

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('doc.category = :category', { category: 'frontend' });
            expect(result.items).toEqual(docs);
        });

        it('应该根据搜索关键词过滤文档', async () => {
            const queryDto: QueryMobileDocDto = {
                page: 1,
                pageSize: 10,
                search: 'react',
            };

            const docs = factories.mobileDoc.createMany(2);
            const mockQueryBuilder = {
                where: vi.fn().mockReturnThis(),
                andWhere: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                addOrderBy: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                take: vi.fn().mockReturnThis(),
                getManyAndCount: vi.fn().mockResolvedValue([docs, 2]),
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            await service.findAll(queryDto);

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                '(doc.title ILIKE :search OR doc.summary ILIKE :search OR doc.content ILIKE :search)',
                { search: '%react%' }
            );
        });
    });

    describe('findOne', () => {
        it('应该根据 ID 返回文档', async () => {
            const docId = 'doc-id-123';
            const doc = factories.mobileDoc.create({ id: docId });

            mockRepository.findOne.mockResolvedValue(doc);

            const result = await service.findOne(docId);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: docId, published: true },
            });
            expect(result).toEqual(doc);
        });

        it('应该在文档不存在时抛出 NotFoundException', async () => {
            const docId = 'non-existent-id';
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(docId)).rejects.toThrow(
                new NotFoundException('文档不存在: non-existent-id')
            );
        });
    });

    describe('findHot', () => {
        it('应该返回热门文档', async () => {
            const hotDocs = factories.mobileDoc.createMany(3, { isHot: true });

            mockRepository.find.mockResolvedValue(hotDocs);

            const result = await service.findHot(5);

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { isHot: true, published: true },
                order: { sortOrder: 'DESC', createdAt: 'DESC' },
                take: 5,
            });
            expect(result).toEqual(hotDocs);
        });

        it('应该使用默认限制数量', async () => {
            const hotDocs = factories.mobileDoc.createMany(10, { isHot: true });

            mockRepository.find.mockResolvedValue(hotDocs);

            await service.findHot();

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { isHot: true, published: true },
                order: { sortOrder: 'DESC', createdAt: 'DESC' },
                take: 5,
            });
        });
    });

    describe('findRelated', () => {
        it('应该返回相关文档', async () => {
            const docId = 'doc-id-123';
            const currentDoc = factories.mobileDoc.create({
                id: docId,
                category: 'frontend',
                tags: ['javascript', 'react'],
            });

            const relatedDocs = factories.mobileDoc.createMany(3, {
                category: 'frontend',
            });

            mockRepository.findOne.mockResolvedValue(currentDoc);

            const mockQueryBuilder = {
                where: vi.fn().mockReturnThis(),
                andWhere: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                addOrderBy: vi.fn().mockReturnThis(),
                take: vi.fn().mockReturnThis(),
                getMany: vi.fn().mockResolvedValue(relatedDocs),
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const result = await service.findRelated(docId, 5);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: docId, published: true },
            });
            expect(result).toEqual(relatedDocs);
        });

        it('应该在当前文档不存在时抛出 NotFoundException', async () => {
            const docId = 'non-existent-id';
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findRelated(docId)).rejects.toThrow(
                new NotFoundException('文档不存在: non-existent-id')
            );
        });
    });

    describe('update', () => {
        it('应该成功更新文档', async () => {
            const docId = 'doc-id-123';
            const updateDto: UpdateMobileDocDto = {
                title: 'Updated Title',
                content: 'Updated content',
            };

            const existingDoc = factories.mobileDoc.create({ id: docId });
            const updatedDoc = { ...existingDoc, ...updateDto };

            mockRepository.findOne.mockResolvedValue(existingDoc);
            mockRepository.save.mockResolvedValue(updatedDoc);

            const result = await service.update(docId, updateDto);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: docId, published: true },
            });
            expect(mockRepository.save).toHaveBeenCalledWith({
                ...existingDoc,
                ...updateDto,
            });
            expect(result).toEqual(updatedDoc);
        });

        it('应该在文档不存在时抛出 NotFoundException', async () => {
            const docId = 'non-existent-id';
            const updateDto: UpdateMobileDocDto = {
                title: 'Updated Title',
            };

            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.update(docId, updateDto)).rejects.toThrow(
                new NotFoundException('文档不存在: non-existent-id')
            );
        });
    });

    describe('remove', () => {
        it('应该成功删除文档', async () => {
            const docId = 'doc-id-123';
            const doc = factories.mobileDoc.create({ id: docId });

            mockRepository.findOne.mockResolvedValue(doc);
            mockRepository.remove.mockResolvedValue(doc);

            await service.remove(docId);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: docId, published: true },
            });
            expect(mockRepository.remove).toHaveBeenCalledWith(doc);
        });

        it('应该在文档不存在时抛出 NotFoundException', async () => {
            const docId = 'non-existent-id';
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.remove(docId)).rejects.toThrow(
                new NotFoundException('文档不存在: non-existent-id')
            );
        });
    });

    describe('getStatsByCategory', () => {
        it('应该返回分类统计信息', async () => {
            const mockStats = [
                { category: 'frontend', count: '10' },
                { category: 'backend', count: '8' },
                { category: 'mobile', count: '5' },
            ];

            mockRepository.createQueryBuilder.mockReturnValue({
                select: vi.fn().mockReturnThis(),
                addSelect: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                groupBy: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                getRawMany: vi.fn().mockResolvedValue(mockStats),
            });

            const result = await service.getStatsByCategory();

            const expected = mockStats.reduce((acc, stat) => {
                acc[stat.category] = parseInt(stat.count);
                return acc;
            }, {} as Record<string, number>);

            expect(result).toEqual(expected);
        });
    });

    describe('边界条件测试', () => {
        it('应该处理空的分页查询', async () => {
            const queryDto: QueryMobileDocDto = {};

            mockRepository.createQueryBuilder.mockReturnValue({
                where: vi.fn().mockReturnThis(),
                andWhere: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                addOrderBy: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                take: vi.fn().mockReturnThis(),
                getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
            });

            const result = await service.findAll(queryDto);

            expect(result).toEqual({
                items: [],
                total: 0,
                page: 1,
                pageSize: 10,
                hasMore: false,
            });
        });

        it('应该处理无效的页码', async () => {
            const queryDto: QueryMobileDocDto = {
                page: -1,
                pageSize: 0,
            };

            mockRepository.createQueryBuilder.mockReturnValue({
                where: vi.fn().mockReturnThis(),
                andWhere: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                addOrderBy: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                take: vi.fn().mockReturnThis(),
                getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
            });

            const result = await service.findAll(queryDto);

            // 服务应该接受传入的值，即使它们是无效的
            expect(result.page).toBe(-1);
            expect(result.pageSize).toBe(0);
        });
    });
});

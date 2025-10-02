import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { factories } from '../../test/factories';
import { CreateMobileDocDto } from './dto/create-mobile-doc.dto';
import { QueryMobileDocDto } from './dto/query-mobile-doc.dto';
import { UpdateMobileDocDto } from './dto/update-mobile-doc.dto';
import { MobileController } from './mobile.controller';
import { MobileService } from './mobile.service';

describe('MobileController', () => {
    let controller: MobileController;
    let mobileService: MobileService;

    const mockMobileService = {
        create: vi.fn(),
        findAll: vi.fn(),
        findOne: vi.fn(),
        findHot: vi.fn(),
        findRelated: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
        getStatsByCategory: vi.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MobileController],
            providers: [
                {
                    provide: MobileService,
                    useValue: mockMobileService,
                },
            ],
        }).compile();

        controller = module.get<MobileController>(MobileController);
        mobileService = module.get<MobileService>(MobileService);

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

            const createdDoc = factories.mobileDoc.create({
                ...createDto,
                id: 'doc-id-123',
            });

            mockMobileService.create.mockResolvedValue(createdDoc);

            const result = await controller.create(createDto);

            expect(mockMobileService.create).toHaveBeenCalledWith(createDto);
            expect(result).toEqual(createdDoc);
        });

        it('应该传播服务层的错误', async () => {
            const createDto: CreateMobileDocDto = {
                title: 'Test Document',
                content: 'Test content',
                author: 'Test Author',
                category: 'frontend',
            };

            const error = new BadRequestException('Invalid data');
            mockMobileService.create.mockRejectedValue(error);

            await expect(controller.create(createDto)).rejects.toThrow(error);
        });
    });

    describe('findAll', () => {
        it('应该返回分页的文档列表', async () => {
            const queryDto: QueryMobileDocDto = {
                page: 1,
                pageSize: 10,
            };

            const paginatedResult = {
                items: factories.mobileDoc.createMany(5),
                total: 15,
                page: 1,
                pageSize: 10,
                hasMore: true,
            };

            mockMobileService.findAll.mockResolvedValue(paginatedResult);

            const result = await controller.findAll(queryDto);

            expect(mockMobileService.findAll).toHaveBeenCalledWith(queryDto);
            expect(result).toEqual(paginatedResult);
        });

        it('应该处理空的查询参数', async () => {
            const queryDto: QueryMobileDocDto = {};

            const paginatedResult = {
                items: [],
                total: 0,
                page: 1,
                pageSize: 10,
                hasMore: false,
            };

            mockMobileService.findAll.mockResolvedValue(paginatedResult);

            const result = await controller.findAll(queryDto);

            expect(mockMobileService.findAll).toHaveBeenCalledWith(queryDto);
            expect(result).toEqual(paginatedResult);
        });

        it('应该根据分类过滤文档', async () => {
            const queryDto: QueryMobileDocDto = {
                category: 'frontend',
                page: 1,
                pageSize: 10,
            };

            const paginatedResult = {
                items: factories.mobileDoc.createMany(3, { category: 'frontend' }),
                total: 3,
                page: 1,
                pageSize: 10,
                hasMore: false,
            };

            mockMobileService.findAll.mockResolvedValue(paginatedResult);

            const result = await controller.findAll(queryDto);

            expect(mockMobileService.findAll).toHaveBeenCalledWith(queryDto);
            expect(result).toEqual(paginatedResult);
        });

        it('应该根据搜索关键词过滤文档', async () => {
            const queryDto: QueryMobileDocDto = {
                search: 'react',
                page: 1,
                pageSize: 10,
            };

            const paginatedResult = {
                items: factories.mobileDoc.createMany(2),
                total: 2,
                page: 1,
                pageSize: 10,
                hasMore: false,
            };

            mockMobileService.findAll.mockResolvedValue(paginatedResult);

            const result = await controller.findAll(queryDto);

            expect(mockMobileService.findAll).toHaveBeenCalledWith(queryDto);
            expect(result).toEqual(paginatedResult);
        });
    });

    describe('findOne', () => {
        it('应该根据 ID 返回文档', async () => {
            const docId = 'doc-id-123';
            const doc = factories.mobileDoc.create({ id: docId });

            mockMobileService.findOne.mockResolvedValue(doc);

            const result = await controller.findOne(docId);

            expect(mockMobileService.findOne).toHaveBeenCalledWith(docId);
            expect(result).toEqual(doc);
        });

        it('应该在文档不存在时抛出 NotFoundException', async () => {
            const docId = 'non-existent-id';
            const error = new NotFoundException('Mobile document not found');

            mockMobileService.findOne.mockRejectedValue(error);

            await expect(controller.findOne(docId)).rejects.toThrow(error);
        });
    });

    describe('findHot', () => {
        it('应该返回热门文档', async () => {
            const hotDocs = factories.mobileDoc.createMany(5, { isHot: true });

            mockMobileService.findHot.mockResolvedValue(hotDocs);

            const result = await controller.findHot();

            expect(mockMobileService.findHot).toHaveBeenCalledWith(10);
            expect(result).toEqual(hotDocs);
        });

        it('应该支持自定义限制数量', async () => {
            const limit = 5;
            const hotDocs = factories.mobileDoc.createMany(limit, { isHot: true });

            mockMobileService.findHot.mockResolvedValue(hotDocs);

            const result = await controller.findHot(limit);

            expect(mockMobileService.findHot).toHaveBeenCalledWith(limit);
            expect(result).toEqual(hotDocs);
        });
    });

    describe('findRelated', () => {
        it('应该返回相关文档', async () => {
            const docId = 'doc-id-123';
            const relatedDocs = factories.mobileDoc.createMany(3);

            mockMobileService.findRelated.mockResolvedValue(relatedDocs);

            const result = await controller.findRelated(docId);

            expect(mockMobileService.findRelated).toHaveBeenCalledWith(docId, 5);
            expect(result).toEqual(relatedDocs);
        });

        it('应该支持自定义限制数量', async () => {
            const docId = 'doc-id-123';
            const limit = 10;
            const relatedDocs = factories.mobileDoc.createMany(limit);

            mockMobileService.findRelated.mockResolvedValue(relatedDocs);

            const result = await controller.findRelated(docId, limit);

            expect(mockMobileService.findRelated).toHaveBeenCalledWith(docId, limit);
            expect(result).toEqual(relatedDocs);
        });

        it('应该在当前文档不存在时抛出 NotFoundException', async () => {
            const docId = 'non-existent-id';
            const error = new NotFoundException('Mobile document not found');

            mockMobileService.findRelated.mockRejectedValue(error);

            await expect(controller.findRelated(docId)).rejects.toThrow(error);
        });
    });

    describe('update', () => {
        it('应该成功更新文档', async () => {
            const docId = 'doc-id-123';
            const updateDto: UpdateMobileDocDto = {
                title: 'Updated Title',
                content: 'Updated content',
            };

            const updatedDoc = factories.mobileDoc.create({
                id: docId,
                ...updateDto,
            });

            mockMobileService.update.mockResolvedValue(updatedDoc);

            const result = await controller.update(docId, updateDto);

            expect(mockMobileService.update).toHaveBeenCalledWith(docId, updateDto);
            expect(result).toEqual(updatedDoc);
        });

        it('应该在文档不存在时抛出 NotFoundException', async () => {
            const docId = 'non-existent-id';
            const updateDto: UpdateMobileDocDto = {
                title: 'Updated Title',
            };

            const error = new NotFoundException('Mobile document not found');
            mockMobileService.update.mockRejectedValue(error);

            await expect(controller.update(docId, updateDto)).rejects.toThrow(error);
        });
    });

    describe('remove', () => {
        it('应该成功删除文档', async () => {
            const docId = 'doc-id-123';

            mockMobileService.remove.mockResolvedValue(undefined);

            await controller.remove(docId);

            expect(mockMobileService.remove).toHaveBeenCalledWith(docId);
        });

        it('应该在文档不存在时抛出 NotFoundException', async () => {
            const docId = 'non-existent-id';
            const error = new NotFoundException('Mobile document not found');

            mockMobileService.remove.mockRejectedValue(error);

            await expect(controller.remove(docId)).rejects.toThrow(error);
        });
    });

    describe('getStats', () => {
        it('应该返回分类统计信息', async () => {
            const stats = [
                { category: 'frontend', count: 10 },
                { category: 'backend', count: 8 },
                { category: 'mobile', count: 5 },
            ];

            mockMobileService.getStatsByCategory.mockResolvedValue(stats);

            const result = await controller.getStats();

            expect(mockMobileService.getStatsByCategory).toHaveBeenCalled();
            expect(result).toEqual(stats);
        });

        it('应该处理空的统计结果', async () => {
            mockMobileService.getStatsByCategory.mockResolvedValue([]);

            const result = await controller.getStats();

            expect(result).toEqual([]);
        });
    });

    describe('错误处理', () => {
        it('应该传播服务层的所有错误', async () => {
            const docId = 'doc-id-123';
            const error = new Error('Database connection failed');

            mockMobileService.findOne.mockRejectedValue(error);

            await expect(controller.findOne(docId)).rejects.toThrow(error);
        });

        it('应该处理意外的错误', async () => {
            const createDto: CreateMobileDocDto = {
                title: 'Test Document',
                content: 'Test content',
                author: 'Test Author',
                category: 'frontend',
            };

            const error = new Error('Unexpected error');
            mockMobileService.create.mockRejectedValue(error);

            await expect(controller.create(createDto)).rejects.toThrow(error);
        });
    });

    describe('参数验证', () => {
        it('应该接受有效的查询参数', async () => {
            const queryDto: QueryMobileDocDto = {
                page: 2,
                pageSize: 20,
                category: 'backend',
                search: 'nodejs',
                tags: ['api', 'database'],
            };

            const paginatedResult = {
                items: factories.mobileDoc.createMany(2),
                total: 2,
                page: 2,
                pageSize: 20,
                hasMore: false,
            };

            mockMobileService.findAll.mockResolvedValue(paginatedResult);

            const result = await controller.findAll(queryDto);

            expect(mockMobileService.findAll).toHaveBeenCalledWith(queryDto);
            expect(result).toEqual(paginatedResult);
        });

        it('应该处理部分更新数据', async () => {
            const docId = 'doc-id-123';
            const updateDto: UpdateMobileDocDto = {
                isHot: true,
            };

            const updatedDoc = factories.mobileDoc.create({
                id: docId,
                isHot: true,
            });

            mockMobileService.update.mockResolvedValue(updatedDoc);

            const result = await controller.update(docId, updateDto);

            expect(mockMobileService.update).toHaveBeenCalledWith(docId, updateDto);
            expect(result.isHot).toBe(true);
        });
    });
});

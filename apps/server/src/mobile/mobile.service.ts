import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMobileDocDto } from './dto/create-mobile-doc.dto';
import { QueryMobileDocDto } from './dto/query-mobile-doc.dto';
import { UpdateMobileDocDto } from './dto/update-mobile-doc.dto';
import { DocCategory, MobileDoc } from './entities/mobile-doc.entity';

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

@Injectable()
export class MobileService {
    private readonly logger = new Logger(MobileService.name);

    constructor(
        @InjectRepository(MobileDoc)
        private readonly mobileDocRepository: Repository<MobileDoc>,
    ) { }

    /**
     * 创建文档
     */
    async create(createMobileDocDto: CreateMobileDocDto): Promise<MobileDoc> {
        this.logger.log(`创建文档: ${createMobileDocDto.title}`);

        const doc = this.mobileDocRepository.create(createMobileDocDto);
        return await this.mobileDocRepository.save(doc);
    }

    /**
     * 批量创建文档
     */
    async createMany(createMobileDocDtos: CreateMobileDocDto[]): Promise<MobileDoc[]> {
        this.logger.log(`批量创建文档: ${createMobileDocDtos.length} 个`);

        const docs = this.mobileDocRepository.create(createMobileDocDtos);
        return await this.mobileDocRepository.save(docs);
    }

    /**
     * 分页查询文档列表
     */
    async findAll(query: QueryMobileDocDto): Promise<PaginatedResult<MobileDoc>> {
        const { page = 1, pageSize = 10, category, search, tag, isHot, published = true } = query;

        this.logger.log(`查询文档列表: page=${page}, pageSize=${pageSize}, category=${category}`);

        const queryBuilder = this.mobileDocRepository.createQueryBuilder('doc');

        // 基础过滤条件
        queryBuilder.where('doc.published = :published', { published });

        // 分类过滤
        if (category && category !== DocCategory.LATEST) {
            queryBuilder.andWhere('doc.category = :category', { category });
        }

        // 关键词搜索
        if (search) {
            queryBuilder.andWhere(
                '(doc.title ILIKE :search OR doc.summary ILIKE :search OR doc.content ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        // 标签过滤
        if (tag) {
            queryBuilder.andWhere('doc.tags @> :tag', { tag: JSON.stringify([tag]) });
        }

        // 热门过滤
        if (isHot !== undefined) {
            queryBuilder.andWhere('doc.isHot = :isHot', { isHot });
        }

        // 排序：热门优先，然后按排序权重和创建时间
        queryBuilder.orderBy('doc.isHot', 'DESC');
        queryBuilder.addOrderBy('doc.sortOrder', 'DESC');
        queryBuilder.addOrderBy('doc.createdAt', 'DESC');

        // 分页
        const offset = (page - 1) * pageSize;
        queryBuilder.skip(offset).take(pageSize);

        const [items, total] = await queryBuilder.getManyAndCount();

        return {
            items,
            total,
            page,
            pageSize,
            hasMore: offset + pageSize < total,
        };
    }

    /**
     * 根据ID查找文档
     */
    async findOne(id: string): Promise<MobileDoc> {
        this.logger.log(`查找文档: ${id}`);

        const doc = await this.mobileDocRepository.findOne({
            where: { id, published: true },
        });

        if (!doc) {
            throw new NotFoundException(`文档不存在: ${id}`);
        }

        return doc;
    }

    /**
     * 根据分类获取文档统计
     */
    async getStatsByCategory(): Promise<Record<string, number>> {
        this.logger.log('获取分类统计');

        const queryBuilder = this.mobileDocRepository.createQueryBuilder('doc');
        queryBuilder.select('doc.category', 'category');
        queryBuilder.addSelect('COUNT(*)', 'count');
        queryBuilder.where('doc.published = :published', { published: true });
        queryBuilder.groupBy('doc.category');

        const stats = await queryBuilder.getRawMany();

        const result: Record<string, number> = {};
        stats.forEach(stat => {
            result[stat.category] = parseInt(stat.count);
        });

        return result;
    }

    /**
     * 获取热门文档
     */
    async getHotDocs(limit: number = 5): Promise<MobileDoc[]> {
        this.logger.log(`获取热门文档: limit=${limit}`);

        return await this.mobileDocRepository.find({
            where: { isHot: true, published: true },
            order: { sortOrder: 'DESC', createdAt: 'DESC' },
            take: limit,
        });
    }

    /**
     * 获取热门文档（别名方法）
     */
    async findHot(limit: number = 5): Promise<MobileDoc[]> {
        return await this.getHotDocs(limit);
    }

    /**
     * 获取相关文档
     */
    async getRelatedDocs(id: string, limit: number = 5): Promise<MobileDoc[]> {
        this.logger.log(`获取相关文档: id=${id}, limit=${limit}`);

        const currentDoc = await this.findOne(id);

        const queryBuilder = this.mobileDocRepository.createQueryBuilder('doc');
        queryBuilder.where('doc.id != :id', { id });
        queryBuilder.andWhere('doc.published = :published', { published: true });
        queryBuilder.andWhere('(doc.category = :category OR doc.tags && :tags)', {
            category: currentDoc.category,
            tags: JSON.stringify(currentDoc.tags),
        });
        queryBuilder.orderBy('doc.isHot', 'DESC');
        queryBuilder.addOrderBy('doc.createdAt', 'DESC');
        queryBuilder.take(limit);

        return await queryBuilder.getMany();
    }

    /**
     * 获取相关文档（别名方法）
     */
    async findRelated(id: string, limit: number = 5): Promise<MobileDoc[]> {
        return await this.getRelatedDocs(id, limit);
    }

    /**
     * 更新文档
     */
    async update(id: string, updateMobileDocDto: UpdateMobileDocDto): Promise<MobileDoc> {
        this.logger.log(`更新文档: ${id}`);

        const doc = await this.findOne(id);
        Object.assign(doc, updateMobileDocDto);

        return await this.mobileDocRepository.save(doc);
    }

    /**
     * 删除文档
     */
    async remove(id: string): Promise<void> {
        this.logger.log(`删除文档: ${id}`);

        const doc = await this.findOne(id);
        await this.mobileDocRepository.remove(doc);
    }

    /**
     * 软删除文档（设置为未发布）
     */
    async softRemove(id: string): Promise<MobileDoc> {
        this.logger.log(`软删除文档: ${id}`);

        return await this.update(id, { published: false });
    }

    /**
     * 清空所有文档
     */
    async clearAll(): Promise<void> {
        this.logger.log('清空所有文档');

        await this.mobileDocRepository.clear();
    }

    /**
     * 根据文件路径查找文档
     */
    async findByFilePath(filePath: string): Promise<MobileDoc | null> {
        return await this.mobileDocRepository.findOne({
            where: { filePath },
        });
    }

    /**
     * 获取分类列表
     */
    async getCategories(): Promise<any[]> {
        this.logger.log('获取分类列表');

        const categories = await this.mobileDocRepository
            .createQueryBuilder('doc')
            .select('doc.category', 'category')
            .addSelect('COUNT(doc.id)', 'count')
            .where('doc.published = :published', { published: true })
            .groupBy('doc.category')
            .orderBy('count', 'DESC')
            .getRawMany();

        return categories.map(item => ({
            value: item.category,
            label: this.getCategoryLabel(item.category),
            count: parseInt(item.count),
        }));
    }

    /**
     * 获取统计信息
     */
    async getStats(): Promise<any> {
        this.logger.log('获取统计信息');

        const [totalCount, publishedCount, hotCount, categoryStats] = await Promise.all([
            this.mobileDocRepository.count(),
            this.mobileDocRepository.count({ where: { published: true } }),
            this.mobileDocRepository.count({ where: { isHot: true } }),
            this.getCategories(),
        ]);

        return {
            total: totalCount,
            published: publishedCount,
            draft: totalCount - publishedCount,
            hot: hotCount,
            categories: categoryStats,
            lastUpdated: new Date(),
        };
    }

    /**
     * 获取分类标签
     */
    private getCategoryLabel(category: string): string {
        const labels: Record<string, string> = {
            latest: '最新',
            frontend: '前端',
            backend: '后端',
            ai: 'AI',
            mobile: '移动端',
            design: '设计',
        };

        return labels[category] || category;
    }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { Tag } from './entities/tag.entity';

interface ArticleQueryParams {
    page: number;
    limit: number;
    category?: string;
    tag?: string;
    search?: string;
}

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
    ) { }

    async findAll(params: ArticleQueryParams) {
        const { page, limit, category, tag, search } = params;
        const skip = (page - 1) * limit;

        const queryBuilder = this.articleRepository.createQueryBuilder('article')
            .leftJoinAndSelect('article.author', 'author')
            .leftJoinAndSelect('article.category', 'category')
            .leftJoinAndSelect('article.tags', 'tags')
            .where('article.published = :published', { published: true })
            .orderBy('article.createdAt', 'DESC')
            .skip(skip)
            .take(limit);

        if (category) {
            queryBuilder.andWhere('category.id = :categoryId', { categoryId: category });
        }

        if (tag) {
            queryBuilder.andWhere('tags.id = :tagId', { tagId: tag });
        }

        if (search) {
            queryBuilder.andWhere(
                '(article.title ILIKE :search OR article.content ILIKE :search OR article.summary ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        const [articles, total] = await queryBuilder.getManyAndCount();

        return {
            items: articles,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const article = await this.articleRepository.findOne({
            where: { id },
            relations: ['author', 'category', 'tags'],
        });

        if (!article) {
            throw new NotFoundException('文章不存在');
        }

        // 更新浏览次数
        article.viewCount += 1;
        await this.articleRepository.save(article);

        return article;
    }

    async create(authorId: string, createArticleDto: CreateArticleDto) {
        // 处理标签
        let tags: Tag[] = [];
        if (createArticleDto.tags && createArticleDto.tags.length > 0) {
            tags = await this.getOrCreateTags(createArticleDto.tags);
        }

        // 创建文章
        const article = this.articleRepository.create({
            ...createArticleDto,
            authorId,
            tags,
        });

        return this.articleRepository.save(article);
    }

    async update(authorId: string, id: string, updateArticleDto: UpdateArticleDto) {
        const article = await this.articleRepository.findOne({
            where: { id, authorId },
            relations: ['tags'],
        });

        if (!article) {
            throw new NotFoundException('文章不存在或您没有权限修改');
        }

        // 处理标签
        if (updateArticleDto.tags) {
            article.tags = await this.getOrCreateTags(updateArticleDto.tags);
        }

        // 更新其他字段
        Object.keys(updateArticleDto).forEach(key => {
            if (key !== 'tags') {
                // 只更新非标签字段，避免覆盖标签 
                (article as any)[key] = updateArticleDto[key as keyof UpdateArticleDto]; // 类型断言
            }
        });

        return this.articleRepository.save(article);
    }

    async remove(authorId: string, id: string) {
        const article = await this.articleRepository.findOne({
            where: { id, authorId },
        });

        if (!article) {
            throw new NotFoundException('文章不存在或您没有权限删除');
        }

        await this.articleRepository.remove(article);
    }

    async publish(authorId: string, id: string) {
        const article = await this.articleRepository.findOne({
            where: { id, authorId },
        });

        if (!article) {
            throw new NotFoundException('文章不存在或您没有权限发布');
        }

        article.published = true;
        return this.articleRepository.save(article);
    }

    async unpublish(authorId: string, id: string) {
        const article = await this.articleRepository.findOne({
            where: { id, authorId },
        });

        if (!article) {
            throw new NotFoundException('文章不存在或您没有权限取消发布');
        }

        article.published = false;
        return this.articleRepository.save(article);
    }

    // 辅助方法：获取或创建标签
    private async getOrCreateTags(tagNames: string[]): Promise<Tag[]> {
        const tags: Tag[] = [];

        for (const name of tagNames) {
            let tag = await this.tagRepository.findOne({ where: { name } });

            if (!tag) {
                tag = this.tagRepository.create({ name });
                await this.tagRepository.save(tag);
            }

            tags.push(tag);
        }

        return tags;
    }
}

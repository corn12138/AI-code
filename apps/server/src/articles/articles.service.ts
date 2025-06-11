import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';

@Injectable()
export class ArticlesService {
    private readonly logger = new Logger(ArticlesService.name);

    constructor(
        @InjectRepository(Article)
        private articlesRepository: Repository<Article>,
    ) { }

    async findAll(): Promise<Article[]> {
        try {
            return await this.articlesRepository.find({
                relations: ['author', 'tags'],
                where: { published: true },
                order: { createdAt: 'DESC' },
            });
        } catch (error) {
            this.logger.error('获取文章列表失败', error);
            throw error;
        }
    }

    async findByTag(tagSlug: string): Promise<Article[]> {
        try {
            return await this.articlesRepository
                .createQueryBuilder('article')
                .leftJoinAndSelect('article.author', 'author')
                .leftJoinAndSelect('article.tags', 'tag')
                .where('article.published = :published', { published: true })
                .andWhere('tag.slug = :tagSlug', { tagSlug })
                .orderBy('article.createdAt', 'DESC')
                .getMany();
        } catch (error) {
            this.logger.error(`按标签获取文章失败: ${tagSlug}`, error);
            throw error;
        }
    }

    async findOne(id: string): Promise<Article | null> {
        try {
            return await this.articlesRepository.findOne({
                where: { id },
                relations: ['author', 'tags'],
            });
        } catch (error) {
            this.logger.error(`获取文章 ${id} 失败`, error);
            throw error;
        }
    }

    async findBySlug(slug: string): Promise<Article | null> {
        try {
            return await this.articlesRepository.findOne({
                where: { slug, published: true },
                relations: ['author', 'tags'],
            });
        } catch (error) {
            this.logger.error(`通过slug获取文章 ${slug} 失败`, error);
            throw error;
        }
    }
}

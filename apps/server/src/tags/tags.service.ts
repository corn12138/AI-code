import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';

@Injectable()
export class TagsService {
    private readonly logger = new Logger(TagsService.name);

    constructor(
        @InjectRepository(Tag)
        private tagsRepository: Repository<Tag>,
    ) { }

    async findAll(): Promise<Tag[]> {
        try {
            this.logger.debug('获取所有标签');

            // 先获取所有标签
            const tags = await this.tagsRepository.find({
                order: { name: 'ASC' }
            });

            // 为每个标签计算文章数量
            const tagsWithCount = await Promise.all(
                tags.map(async (tag) => {
                    let articleCount = 0;

                    try {
                        // 使用原生 SQL 查询文章数量
                        const countResult = await this.tagsRepository.query(`
                            SELECT COUNT(DISTINCT a.id) as count
                            FROM article_tags at
                            INNER JOIN articles a ON at."articleId" = a.id
                            WHERE at."tagId" = $1 AND a.published = true
                        `, [tag.id]);

                        articleCount = parseInt(countResult[0]?.count || '0', 10);
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        this.logger.debug(`无法查询标签 ${tag.name} 的文章数量: ${errorMessage}`);
                        articleCount = 0;
                    }

                    return {
                        ...tag,
                        articleCount,
                    };
                })
            );

            this.logger.debug(`成功获取 ${tagsWithCount.length} 个标签`);
            return tagsWithCount;
        } catch (error) {
            this.logger.error('获取标签列表失败', error);
            throw error;
        }
    }

    async findOne(id: string): Promise<Tag> {
        try {
            const tag = await this.tagsRepository.findOne({
                where: { id },
                relations: ['articles'],
            });

            if (!tag) {
                throw new NotFoundException(`标签 ${id} 不存在`);
            }

            return tag;
        } catch (error) {
            this.logger.error(`获取标签 ${id} 失败`, error);
            throw error;
        }
    }

    async findBySlug(slug: string): Promise<Tag> {
        try {
            const tag = await this.tagsRepository.findOne({
                where: { slug },
                relations: ['articles'],
            });

            if (!tag) {
                throw new NotFoundException(`标签 ${slug} 不存在`);
            }

            return tag;
        } catch (error) {
            this.logger.error(`通过slug获取标签 ${slug} 失败`, error);
            throw error;
        }
    }

    async create(createTagDto: Partial<Tag>): Promise<Tag> {
        try {
            const tag = this.tagsRepository.create(createTagDto);
            return await this.tagsRepository.save(tag);
        } catch (error) {
            this.logger.error('创建标签失败', error);
            throw error;
        }
    }

    async update(id: string, updateTagDto: Partial<Tag>): Promise<Tag> {
        try {
            await this.tagsRepository.update(id, updateTagDto);
            return await this.findOne(id);
        } catch (error) {
            this.logger.error(`更新标签 ${id} 失败`, error);
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        try {
            const result = await this.tagsRepository.delete(id);
            if (result.affected === 0) {
                throw new NotFoundException(`标签 ${id} 不存在`);
            }
        } catch (error) {
            this.logger.error(`删除标签 ${id} 失败`, error);
            throw error;
        }
    }
}

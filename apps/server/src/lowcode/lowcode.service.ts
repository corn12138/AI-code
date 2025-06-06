import { CacheInterceptor } from '@nestjs/cache-manager'; // 正确导入CacheInterceptor
import { Injectable, Logger, NotFoundException, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { LowcodePage } from './entities/lowcode-page.entity';

@Injectable()
@UseInterceptors(CacheInterceptor) // 自动缓存支持
export class LowcodeService {
    private readonly logger = new Logger(LowcodeService.name);

    constructor(
        @InjectRepository(LowcodePage)
        private lowcodePageRepository: Repository<LowcodePage>,
    ) { }

    async findAllByUser(userId: string, page = 1, limit = 10): Promise<{ pages: LowcodePage[], total: number }> {
        // 处理错误类型问题
        try {
            const [pages, total] = await this.lowcodePageRepository.findAndCount({
                where: { ownerId: userId },
                order: { updatedAt: 'DESC' },
                take: limit,
                skip: (page - 1) * limit,
            });

            return { pages, total };
        } catch (error: any) {
            this.logger.error(`获取用户页面失败: ${error.message}`, error.stack);
            throw error;
        }
    }

    async findOne(id: string, userId: string): Promise<LowcodePage> {
        const page = await this.lowcodePageRepository.findOne({
            where: { id, ownerId: userId },
        });

        if (!page) {
            throw new NotFoundException('页面不存在或您没有权限访问');
        }

        return page;
    }

    async create(userId: string, createPageDto: CreatePageDto): Promise<LowcodePage> {
        const page = this.lowcodePageRepository.create({
            ...createPageDto,
            ownerId: userId,
        });

        return this.lowcodePageRepository.save(page);
    }

    async update(id: string, userId: string, updatePageDto: UpdatePageDto): Promise<LowcodePage> {
        const page = await this.findOne(id, userId);

        // 应用更新
        Object.assign(page, updatePageDto);

        return this.lowcodePageRepository.save(page);
    }

    async remove(id: string, userId: string): Promise<void> {
        const page = await this.findOne(id, userId);
        await this.lowcodePageRepository.remove(page);
    }

    async publish(id: string, userId: string): Promise<LowcodePage> {
        const page = await this.findOne(id, userId);

        page.published = true;
        page.publishedAt = new Date();

        return this.lowcodePageRepository.save(page);
    }

    async getPublishedPage(id: string): Promise<LowcodePage> {
        const page = await this.lowcodePageRepository.findOne({
            where: { id, published: true },
        });

        if (!page) {
            throw new NotFoundException('页面不存在或未发布');
        }

        return page;
    }

    async getTemplates(): Promise<any[]> {
        try {
            // 这里可以考虑使用缓存装饰器或内存缓存
            // 实际实现可能会从数据库或文件系统中加载模板
            return [
                {
                    id: 'template-1',
                    name: '博客首页模板',
                    description: '适合博客网站的首页布局',
                    thumbnail: '/templates/blog-home.png',
                    // 避免在这里存储完整内容，可以在选择模板时再加载详细内容
                    contentPreview: { /* 模板预览结构 */ },
                },
                {
                    id: 'template-2',
                    name: '产品展示模板',
                    description: '适合展示产品信息的页面布局',
                    thumbnail: '/templates/product-showcase.png',
                    contentPreview: { /* 模板预览结构 */ },
                },
                {
                    id: 'template-3',
                    name: '个人简介模板',
                    description: '适合个人介绍的简洁布局',
                    thumbnail: '/templates/personal-profile.png',
                    contentPreview: { /* 模板预览结构 */ },
                },
            ];
        } catch (error: any) {
            this.logger.error(`获取模板失败: ${error.message}`, error.stack);
            throw error;
        }
    }

    async getTemplateContent(templateId: string): Promise<any> {
        // 单独获取模板内容的方法，避免一次性加载所有模板内容
        try {
            // 添加索引签名或类型断言
            interface Templates {
                [key: string]: any; // 添加索引签名
                'template-1': any;
                'template-2': any;
                'template-3': any;
            }

            const templates: Templates = {
                'template-1': { /* 模板1的完整内容 */ },
                'template-2': { /* 模板2的完整内容 */ },
                'template-3': { /* 模板3的完整内容 */ },
            };

            if (!templates[templateId]) {
                throw new NotFoundException('模板不存在');
            }

            return templates[templateId];
        } catch (error: any) {
            this.logger.error(`获取模板内容失败: ${error.message}`, error.stack);
            throw error;
        }
    }

    async createFromTemplate(
        userId: string,
        templateId: string,
        createPageDto: CreatePageDto
    ): Promise<LowcodePage> {
        try {
            // 获取模板内容
            const templateContent = await this.getTemplateContent(templateId);

            // 创建新页面，继承模板内容
            const page = this.lowcodePageRepository.create({
                ...createPageDto,
                content: templateContent,
                ownerId: userId,
            });

            return this.lowcodePageRepository.save(page);
        } catch (error: any) {
            this.logger.error(`从模板创建页面失败: ${error.message}`, error.stack);
            throw error;
        }
    }
}

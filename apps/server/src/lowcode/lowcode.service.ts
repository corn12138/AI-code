import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { LowcodePage } from './entities/lowcode-page.entity';

@Injectable()
export class LowcodeService {
    constructor(
        @InjectRepository(LowcodePage)
        private readonly lowcodePageRepository: Repository<LowcodePage>,
    ) { }

    async findAllByUser(userId: string): Promise<LowcodePage[]> {
        return this.lowcodePageRepository.find({
            where: { ownerId: userId },
            order: { updatedAt: 'DESC' },
        });
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
        // 这里返回预定义的模板列表
        // 实际实现可能会从数据库或文件系统中加载模板
        return [
            {
                id: 'template-1',
                name: '博客首页模板',
                description: '适合博客网站的首页布局',
                thumbnail: '/templates/blog-home.png',
                content: {/* 模板内容结构 */ },
            },
            {
                id: 'template-2',
                name: '产品展示模板',
                description: '适合展示产品信息的页面布局',
                thumbnail: '/templates/product-showcase.png',
                content: {/* 模板内容结构 */ },
            },
            {
                id: 'template-3',
                name: '个人简介模板',
                description: '适合个人介绍的简洁布局',
                thumbnail: '/templates/personal-profile.png',
                content: {/* 模板内容结构 */ },
            },
        ];
    }

    async createFromTemplate(
        userId: string,
        templateId: string,
        createPageDto: CreatePageDto
    ): Promise<LowcodePage> {
        // 获取模板
        const templates = await this.getTemplates();
        const template = templates.find(t => t.id === templateId);

        if (!template) {
            throw new NotFoundException('模板不存在');
        }

        // 创建新页面，继承模板内容
        const page = this.lowcodePageRepository.create({
            ...createPageDto,
            content: template.content,
            ownerId: userId,
        });

        return this.lowcodePageRepository.save(page);
    }
}

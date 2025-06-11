import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { Article } from './article.entity';
import { ArticlesService } from './articles.service';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: '获取所有文章' })
    @ApiResponse({ status: 200, description: '成功获取文章列表', type: [Article] })
    async findAll(@Query('tag') tag?: string): Promise<{ articles: Article[], total: number }> {
        let articles: Article[];

        if (tag) {
            // 按标签过滤文章
            articles = await this.articlesService.findByTag(tag);
        } else {
            // 获取所有文章
            articles = await this.articlesService.findAll();
        }

        return {
            articles,
            total: articles.length
        };
    }

    @Public()
    @Get(':slug')
    @ApiOperation({ summary: '根据slug获取文章' })
    @ApiResponse({ status: 200, description: '成功获取文章', type: Article })
    @ApiResponse({ status: 404, description: '文章不存在' })
    async findBySlug(@Param('slug') slug: string): Promise<Article | null> {
        return await this.articlesService.findBySlug(slug);
    }
}

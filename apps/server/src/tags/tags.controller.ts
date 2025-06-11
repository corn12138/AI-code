import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { Tag } from './tag.entity';
import { TagsService } from './tags.service';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: '获取所有标签' })
    @ApiResponse({ status: 200, description: '成功获取标签列表', type: [Tag] })
    async findAll(): Promise<Tag[]> {
        return await this.tagsService.findAll();
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: '根据ID获取标签' })
    @ApiResponse({ status: 200, description: '成功获取标签', type: Tag })
    @ApiResponse({ status: 404, description: '标签不存在' })
    async findOne(@Param('id') id: string): Promise<Tag> {
        return await this.tagsService.findOne(id);
    }

    @Public()
    @Get('slug/:slug')
    @ApiOperation({ summary: '根据slug获取标签' })
    @ApiResponse({ status: 200, description: '成功获取标签', type: Tag })
    @ApiResponse({ status: 404, description: '标签不存在' })
    async findBySlug(@Param('slug') slug: string): Promise<Tag> {
        return await this.tagsService.findBySlug(slug);
    }
}

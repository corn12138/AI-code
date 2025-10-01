import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CreateMobileDocDto } from './dto/create-mobile-doc.dto';
import { QueryMobileDocDto } from './dto/query-mobile-doc.dto';
import { UpdateMobileDocDto } from './dto/update-mobile-doc.dto';
import { MobileDoc } from './entities/mobile-doc.entity';
import { MobileService, PaginatedResult } from './mobile.service';

@ApiTags('mobile')
@Controller('mobile')
export class MobileController {
    private readonly logger = new Logger(MobileController.name);

    constructor(private readonly mobileService: MobileService) { }

    @Public()
    @Post('docs')
    @ApiOperation({ summary: '创建文档' })
    @ApiResponse({ status: 201, description: '文档创建成功', type: MobileDoc })
    async create(@Body() createMobileDocDto: CreateMobileDocDto): Promise<MobileDoc> {
        this.logger.log(`创建文档请求: ${createMobileDocDto.title}`);
        return await this.mobileService.create(createMobileDocDto);
    }

    @Public()
    @Post('docs/batch')
    @ApiOperation({ summary: '批量创建文档' })
    @ApiResponse({ status: 201, description: '文档批量创建成功', type: [MobileDoc] })
    async createMany(@Body() createMobileDocDtos: CreateMobileDocDto[]): Promise<MobileDoc[]> {
        this.logger.log(`批量创建文档请求: ${createMobileDocDtos.length} 个`);
        return await this.mobileService.createMany(createMobileDocDtos);
    }

    @Public()
    @Get('docs')
    @ApiOperation({ summary: '获取文档列表' })
    @ApiResponse({
        status: 200,
        description: '成功获取文档列表',
        schema: {
            type: 'object',
            properties: {
                items: { type: 'array', items: { $ref: '#/components/schemas/MobileDoc' } },
                total: { type: 'number' },
                page: { type: 'number' },
                pageSize: { type: 'number' },
                hasMore: { type: 'boolean' },
            },
        },
    })
    async findAll(@Query() query: QueryMobileDocDto): Promise<PaginatedResult<MobileDoc>> {
        this.logger.log(`获取文档列表请求: ${JSON.stringify(query)}`);
        return await this.mobileService.findAll(query);
    }

    @Public()
    @Get('docs/stats')
    @ApiOperation({ summary: '获取文档分类统计' })
    @ApiResponse({ status: 200, description: '成功获取统计信息' })
    async getStats(): Promise<Record<string, number>> {
        this.logger.log('获取文档统计请求');
        return await this.mobileService.getStatsByCategory();
    }

    @Public()
    @Get('docs/hot')
    @ApiOperation({ summary: '获取热门文档' })
    @ApiResponse({ status: 200, description: '成功获取热门文档', type: [MobileDoc] })
    async getHotDocs(@Query('limit') limit?: number): Promise<MobileDoc[]> {
        this.logger.log(`获取热门文档请求: limit=${limit}`);
        return await this.mobileService.getHotDocs(limit);
    }

    @Public()
    @Get('docs/:id')
    @ApiOperation({ summary: '根据ID获取文档详情' })
    @ApiResponse({ status: 200, description: '成功获取文档详情', type: MobileDoc })
    @ApiResponse({ status: 404, description: '文档不存在' })
    async findOne(@Param('id') id: string): Promise<MobileDoc> {
        this.logger.log(`获取文档详情请求: ${id}`);
        return await this.mobileService.findOne(id);
    }

    @Public()
    @Get('docs/:id/related')
    @ApiOperation({ summary: '获取相关文档' })
    @ApiResponse({ status: 200, description: '成功获取相关文档', type: [MobileDoc] })
    async getRelatedDocs(
        @Param('id') id: string,
        @Query('limit') limit?: number
    ): Promise<MobileDoc[]> {
        this.logger.log(`获取相关文档请求: id=${id}, limit=${limit}`);
        return await this.mobileService.getRelatedDocs(id, limit);
    }

    @Patch('docs/:id')
    @ApiOperation({ summary: '更新文档' })
    @ApiResponse({ status: 200, description: '文档更新成功', type: MobileDoc })
    @ApiResponse({ status: 404, description: '文档不存在' })
    async update(
        @Param('id') id: string,
        @Body() updateMobileDocDto: UpdateMobileDocDto
    ): Promise<MobileDoc> {
        this.logger.log(`更新文档请求: ${id}`);
        return await this.mobileService.update(id, updateMobileDocDto);
    }

    @Delete('docs/:id')
    @ApiOperation({ summary: '删除文档' })
    @ApiResponse({ status: 200, description: '文档删除成功' })
    @ApiResponse({ status: 404, description: '文档不存在' })
    async remove(@Param('id') id: string): Promise<{ message: string }> {
        this.logger.log(`删除文档请求: ${id}`);
        await this.mobileService.remove(id);
        return { message: '文档删除成功' };
    }

    @Patch('docs/:id/unpublish')
    @ApiOperation({ summary: '取消发布文档' })
    @ApiResponse({ status: 200, description: '文档取消发布成功', type: MobileDoc })
    @ApiResponse({ status: 404, description: '文档不存在' })
    async unpublish(@Param('id') id: string): Promise<MobileDoc> {
        this.logger.log(`取消发布文档请求: ${id}`);
        return await this.mobileService.softRemove(id);
    }

    @Public()
    @Delete('docs/clear')
    @ApiOperation({ summary: '清空所有文档（危险操作）' })
    @ApiResponse({ status: 200, description: '所有文档清空成功' })
    async clearAll(): Promise<{ message: string }> {
        this.logger.log('清空所有文档请求');
        await this.mobileService.clearAll();
        return { message: '所有文档清空成功' };
    }
}

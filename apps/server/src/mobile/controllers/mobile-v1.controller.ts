import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Req
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateMobileDocDto } from '../dto/create-mobile-doc.dto';
import { QueryMobileDocDto } from '../dto/query-mobile-doc.dto';
import { UpdateMobileDocDto } from '../dto/update-mobile-doc.dto';
import { MobileDoc } from '../entities/mobile-doc.entity';
import { MobileService } from '../mobile.service';
import { PaginatedResponse, SuccessResponse } from '../types/client.types';
import { BaseController } from './base.controller';

/**
 * 移动端 API v1 控制器
 * 为 iOS、Android 和 Web 提供统一的移动端 API
 */
@ApiTags('mobile-v1')
@Controller('mobile/v1')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class MobileV1Controller extends BaseController {
    constructor(private readonly mobileService: MobileService) {
        super('MobileV1Controller');
    }

    /**
     * 获取文档列表
     * 支持分页、分类、搜索等功能
     */
    @Get('docs')
    @ApiOperation({
        summary: '获取文档列表',
        description: '获取分页的文档列表，支持分类筛选、搜索、标签过滤等功能'
    })
    @ApiResponse({
        status: 200,
        description: '成功获取文档列表',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'object',
                    properties: {
                        items: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/MobileDoc' }
                        },
                        total: { type: 'number' },
                        page: { type: 'number' },
                        pageSize: { type: 'number' },
                        hasMore: { type: 'boolean' },
                        cursor: { type: 'string' },
                        nextCursor: { type: 'string' }
                    }
                },
                traceId: { type: 'string' },
                timestamp: { type: 'string' }
            }
        }
    })
    async getDocs(
        @Query() query: QueryMobileDocDto,
        @Req() request: Request,
    ): Promise<SuccessResponse<PaginatedResponse<MobileDoc>>> {
        this.logClientRequest(request, 'Get docs list');

        try {
            const result = await this.mobileService.findAll(query);
            const clientType = this.getClientType(request);

            return {
                success: true,
                data: result,
                traceId: this.generateTraceId(),
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            this.logClientError(request, 'Get docs list', error);
            throw error;
        }
    }

    /**
     * 获取文档详情
     */
    @Get('docs/:id')
    @ApiOperation({
        summary: '获取文档详情',
        description: '根据文档ID获取详细信息'
    })
    @ApiResponse({
        status: 200,
        description: '成功获取文档详情',
        type: MobileDoc,
    })
    @ApiResponse({
        status: 404,
        description: '文档不存在',
    })
    async getDocById(
        @Param('id') id: string,
        @Req() request: Request,
    ): Promise<SuccessResponse<MobileDoc>> {
        this.logClientRequest(request, 'Get doc by ID');

        try {
            const doc = await this.mobileService.findOne(id);
            return {
                success: true,
                data: doc,
                traceId: this.generateTraceId(),
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            this.logClientError(request, 'Get doc by ID', error);
            throw error;
        }
    }

    /**
     * 创建文档
     */
    @Post('docs')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: '创建文档',
        description: '创建新的文档'
    })
    @ApiResponse({
        status: 201,
        description: '文档创建成功',
        type: MobileDoc,
    })
    @ApiResponse({
        status: 400,
        description: '请求参数错误',
    })
    async createDoc(
        @Body() createDocDto: CreateMobileDocDto,
        @Req() request: Request,
    ): Promise<SuccessResponse<MobileDoc>> {
        this.logClientRequest(request, 'Create doc');

        try {
            const doc = await this.mobileService.create(createDocDto);
            return {
                success: true,
                data: doc,
                message: '文档创建成功',
                traceId: this.generateTraceId(),
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            this.logClientError(request, 'Create doc', error);
            throw error;
        }
    }

    /**
     * 更新文档
     */
    @Put('docs/:id')
    @ApiOperation({
        summary: '更新文档',
        description: '更新指定文档的信息'
    })
    @ApiResponse({
        status: 200,
        description: '文档更新成功',
        type: MobileDoc,
    })
    @ApiResponse({
        status: 404,
        description: '文档不存在',
    })
    async updateDoc(
        @Param('id') id: string,
        @Body() updateDocDto: UpdateMobileDocDto,
        @Req() request: Request,
    ): Promise<SuccessResponse<MobileDoc>> {
        this.logClientRequest(request, 'Update doc');

        try {
            const doc = await this.mobileService.update(id, updateDocDto);
            return {
                success: true,
                data: doc,
                message: '文档更新成功',
                traceId: this.generateTraceId(),
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            this.logClientError(request, 'Update doc', error);
            throw error;
        }
    }

    /**
     * 删除文档
     */
    @Delete('docs/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: '删除文档',
        description: '删除指定的文档'
    })
    @ApiResponse({
        status: 204,
        description: '文档删除成功',
    })
    @ApiResponse({
        status: 404,
        description: '文档不存在',
    })
    async deleteDoc(
        @Param('id') id: string,
        @Req() request: Request,
    ): Promise<void> {
        this.logClientRequest(request, 'Delete doc');

        try {
            await this.mobileService.remove(id);
        } catch (error) {
            this.logClientError(request, 'Delete doc', error);
            throw error;
        }
    }

    /**
     * 批量创建文档
     */
    @Post('docs/batch')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: '批量创建文档',
        description: '批量创建多个文档'
    })
    @ApiResponse({
        status: 201,
        description: '文档批量创建成功',
        type: [MobileDoc],
    })
    async createDocsBatch(
        @Body() createDocsDto: CreateMobileDocDto[],
        @Req() request: Request,
    ): Promise<SuccessResponse<MobileDoc[]>> {
        this.logClientRequest(request, 'Create docs batch');

        try {
            const docs = await this.mobileService.createMany(createDocsDto);
            return {
                success: true,
                data: docs,
                message: `成功创建 ${docs.length} 个文档`,
                traceId: this.generateTraceId(),
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            this.logClientError(request, 'Create docs batch', error);
            throw error;
        }
    }

    /**
     * 获取分类列表
     */
    @Get('categories')
    @ApiOperation({
        summary: '获取分类列表',
        description: '获取所有可用的文档分类'
    })
    @ApiResponse({
        status: 200,
        description: '成功获取分类列表',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            value: { type: 'string' },
                            label: { type: 'string' },
                            count: { type: 'number' }
                        }
                    }
                }
            }
        }
    })
    async getCategories(@Req() request: Request): Promise<SuccessResponse<any[]>> {
        this.logClientRequest(request, 'Get categories');

        try {
            const categories = await this.mobileService.getCategories();
            return {
                success: true,
                data: categories,
                traceId: this.generateTraceId(),
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            this.logClientError(request, 'Get categories', error);
            throw error;
        }
    }

    /**
     * 生成跟踪ID
     */
    private generateTraceId(): string {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
}

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
 * Web 端 API v1 控制器
 * 为 Web 应用提供增强功能的 API
 */
@ApiTags('web-v1')
@Controller('web/v1')
export class WebV1Controller extends BaseController {
    constructor(private readonly mobileService: MobileService) {
        super('WebV1Controller');
    }

    /**
     * 获取文档列表（Web 端增强版）
     */
    @Get('docs')
    @ApiOperation({
        summary: '获取文档列表（Web端）',
        description: '获取分页的文档列表，包含Web端特有的元数据'
    })
    @ApiResponse({
        status: 200,
        description: '成功获取文档列表',
    })
    async getDocs(
        @Query() query: QueryMobileDocDto,
        @Req() request: Request,
    ): Promise<SuccessResponse<PaginatedResponse<MobileDoc>>> {
        this.logClientRequest(request, 'Get docs list (Web)');

        try {
            const result = await this.mobileService.findAll(query);

            return {
                success: true,
                data: result,
                traceId: this.generateTraceId(),
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            this.logClientError(request, 'Get docs list (Web)', error);
            throw error;
        }
    }

    /**
     * 获取文档详情（Web 端增强版）
     */
    @Get('docs/:id')
    @ApiOperation({
        summary: '获取文档详情（Web端）',
        description: '获取文档详细信息，包含Web端特有的元数据'
    })
    @ApiResponse({
        status: 200,
        description: '成功获取文档详情',
        type: MobileDoc,
    })
    async getDocById(
        @Param('id') id: string,
        @Req() request: Request,
    ): Promise<SuccessResponse<MobileDoc>> {
        this.logClientRequest(request, 'Get doc by ID (Web)');

        try {
            const doc = await this.mobileService.findOne(id);

            // Web 端可以获取更多信息
            const enhancedDoc = {
                ...doc,
                _web: {
                    wordCount: doc.content.length,
                    estimatedReadTime: Math.ceil(doc.content.length / 500), // 假设每分钟500字
                    lastModified: doc.updatedAt,
                    version: 1,
                    canEdit: true,
                    canDelete: true,
                    shareUrl: `${request.protocol}://${request.get('host')}/docs/${doc.id}`,
                },
            };

            return {
                success: true,
                data: enhancedDoc,
                traceId: this.generateTraceId(),
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            this.logClientError(request, 'Get doc by ID (Web)', error);
            throw error;
        }
    }

    /**
     * 创建文档（Web 端）
     */
    @Post('docs')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: '创建文档（Web端）',
        description: '创建新的文档，支持Web端特有的功能'
    })
    @ApiResponse({
        status: 201,
        description: '文档创建成功',
        type: MobileDoc,
    })
    async createDoc(
        @Body() createDocDto: CreateMobileDocDto,
        @Req() request: Request,
    ): Promise<SuccessResponse<MobileDoc>> {
        this.logClientRequest(request, 'Create doc (Web)');

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
            this.logClientError(request, 'Create doc (Web)', error);
            throw error;
        }
    }

    /**
     * 更新文档（Web 端）
     */
    @Put('docs/:id')
    @ApiOperation({
        summary: '更新文档（Web端）',
        description: '更新指定文档的信息，支持Web端特有的功能'
    })
    @ApiResponse({
        status: 200,
        description: '文档更新成功',
        type: MobileDoc,
    })
    async updateDoc(
        @Param('id') id: string,
        @Body() updateDocDto: UpdateMobileDocDto,
        @Req() request: Request,
    ): Promise<SuccessResponse<MobileDoc>> {
        this.logClientRequest(request, 'Update doc (Web)');

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
            this.logClientError(request, 'Update doc (Web)', error);
            throw error;
        }
    }

    /**
     * 删除文档（Web 端）
     */
    @Delete('docs/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: '删除文档（Web端）',
        description: '删除指定的文档'
    })
    @ApiResponse({
        status: 204,
        description: '文档删除成功',
    })
    async deleteDoc(
        @Param('id') id: string,
        @Req() request: Request,
    ): Promise<void> {
        this.logClientRequest(request, 'Delete doc (Web)');

        try {
            await this.mobileService.remove(id);
        } catch (error) {
            this.logClientError(request, 'Delete doc (Web)', error);
            throw error;
        }
    }

    /**
     * 获取文档统计信息（Web 端特有）
     */
    @Get('docs/stats')
    @ApiOperation({
        summary: '获取文档统计信息',
        description: '获取文档的统计信息，包括总数、分类分布等'
    })
    @ApiResponse({
        status: 200,
        description: '成功获取统计信息',
    })
    async getDocsStats(@Req() request: Request): Promise<SuccessResponse<any>> {
        this.logClientRequest(request, 'Get docs stats');

        try {
            const stats = await this.mobileService.getStats();

            return {
                success: true,
                data: stats,
                traceId: this.generateTraceId(),
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            this.logClientError(request, 'Get docs stats', error);
            throw error;
        }
    }

    /**
     * 搜索文档（Web 端增强版）
     */
    @Get('docs/search')
    @ApiOperation({
        summary: '搜索文档',
        description: '全文搜索文档，支持高亮显示'
    })
    @ApiResponse({
        status: 200,
        description: '搜索成功',
    })
    async searchDocs(
        @Query('q') query: string,
        @Query('page') page: number = 1,
        @Query('pageSize') pageSize: number = 10,
        @Req() request: Request,
    ): Promise<SuccessResponse<PaginatedResponse<MobileDoc>>> {
        this.logClientRequest(request, 'Search docs');

        try {
            const searchQuery: QueryMobileDocDto = {
                search: query,
                page,
                pageSize,
            };

            const result = await this.mobileService.findAll(searchQuery);

            return {
                success: true,
                data: result,
                traceId: this.generateTraceId(),
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            this.logClientError(request, 'Search docs', error);
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

import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { LowcodeService } from './lowcode.service';

@ApiTags('lowcode')
@Controller('lowcode')
export class LowcodeController {
  constructor(private readonly lowcodeService: LowcodeService) { }

  @Get('pages')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户的所有页面' })
  @ApiResponse({ status: 200, description: '成功获取页面列表' })
  async getMyPages(@Req() req: Request & { user: { id: string } }) {
    return this.lowcodeService.findAllByUser(req.user.id);
  }

  @Get('pages/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取特定页面' })
  @ApiResponse({ status: 200, description: '成功获取页面' })
  @ApiResponse({ status: 404, description: '页面不存在' })
  async getPage(@Req() req: Request & { user: { id: string } }, @Param('id') id: string) {
    return this.lowcodeService.findOne(id, req.user.id);
  }

  @Post('pages')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建新页面' })
  @ApiResponse({ status: 201, description: '成功创建页面' })
  async createPage(
    @Req() req: Request & { user: { id: string } },
    @Body() createPageDto: CreatePageDto
  ) {
    return this.lowcodeService.create(req.user.id, createPageDto);
  }

  @Patch('pages/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新页面' })
  @ApiResponse({ status: 200, description: '成功更新页面' })
  @ApiResponse({ status: 404, description: '页面不存在' })
  async updatePage(
    @Req() req: Request & { user: { id: string } },
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto
  ) {
    return this.lowcodeService.update(id, req.user.id, updatePageDto);
  }

  @Delete('pages/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除页面' })
  @ApiResponse({ status: 200, description: '成功删除页面' })
  @ApiResponse({ status: 404, description: '页面不存在' })
  async deletePage(@Req() req: Request & { user: { id: string } }, @Param('id') id: string) {
    await this.lowcodeService.remove(id, req.user.id);
    return { message: '页面已成功删除' };
  }

  @Post('pages/:id/publish')
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布页面' })
  @ApiResponse({ status: 200, description: '成功发布页面' })
  @ApiResponse({ status: 404, description: '页面不存在' })
  async publishPage(@Req() req: Request & { user: { id: string } }, @Param('id') id: string) {
    return this.lowcodeService.publish(id, req.user.id);
  }

  @Get('preview/:id')
  @Public()
  @ApiOperation({ summary: '预览已发布的页面' })
  @ApiResponse({ status: 200, description: '成功获取页面预览数据' })
  @ApiResponse({ status: 404, description: '页面不存在或未发布' })
  async previewPage(@Param('id') id: string) {
    return this.lowcodeService.getPublishedPage(id);
  }

  @Get('templates')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取模板列表' })
  @ApiResponse({ status: 200, description: '成功获取模板列表' })
  async getTemplates() {
    return this.lowcodeService.getTemplates();
  }

  @Post('pages/from-template/:templateId')
  @ApiBearerAuth()
  @ApiOperation({ summary: '从模板创建页面' })
  @ApiResponse({ status: 201, description: '成功从模板创建页面' })
  async createFromTemplate(
    @Req() req: Request & { user: { id: string } },
    @Param('templateId') templateId: string,
    @Body() createPageDto: CreatePageDto
  ) {
    return this.lowcodeService.createFromTemplate(req.user.id, templateId, createPageDto);
  }
}

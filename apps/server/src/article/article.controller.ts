import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

interface RequestWithUser extends Request {
  user: {
    id: string;
    roles?: string[];
  };
}

interface ArticleQueryParams {
  page: number;
  limit: number;
  category?: string;
  tag?: string;
  search?: string;
}

@ApiTags('articles')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) { }

  @Get()
  @ApiOperation({ summary: '获取文章列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: '成功获取文章列表' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
  ) {
    const queryParams: ArticleQueryParams = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      category,
      tag,
      search,
    };

    return this.articleService.findAll(queryParams);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单篇文章' })
  @ApiResponse({ status: 200, description: '成功获取文章' })
  @ApiResponse({ status: 404, description: '文章不存在' })
  async findOne(@Param('id') id: string) {
    return this.articleService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin', 'editor')
  @ApiOperation({ summary: '创建文章' })
  @ApiResponse({ status: 201, description: '成功创建文章' })
  async create(@Req() req: RequestWithUser, @Body() createArticleDto: CreateArticleDto) {
    return this.articleService.create(req.user.id, createArticleDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin', 'editor')
  @ApiOperation({ summary: '更新文章' })
  @ApiResponse({ status: 200, description: '成功更新文章' })
  @ApiResponse({ status: 404, description: '文章不存在' })
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articleService.update(req.user.id, id, updateArticleDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin', 'editor')
  @ApiOperation({ summary: '删除文章' })
  @ApiResponse({ status: 200, description: '成功删除文章' })
  @ApiResponse({ status: 404, description: '文章不存在' })
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    await this.articleService.remove(req.user.id, id);
    return { message: '文章已成功删除' };
  }

  @Post(':id/publish')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin', 'editor')
  @ApiOperation({ summary: '发布文章' })
  @ApiResponse({ status: 200, description: '成功发布文章' })
  @ApiResponse({ status: 404, description: '文章不存在' })
  async publish(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.articleService.publish(req.user.id, id);
  }

  @Post(':id/unpublish')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin', 'editor')
  @ApiOperation({ summary: '取消发布文章' })
  @ApiResponse({ status: 200, description: '成功取消发布文章' })
  @ApiResponse({ status: 404, description: '文章不存在' })
  async unpublish(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.articleService.unpublish(req.user.id, id);
  }
}

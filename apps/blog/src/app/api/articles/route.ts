import {
    createApiResponse,
    handleApiError,
    parseRequestBody,
    requireAuth,
    validateFields,
    validateMethod
} from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// 获取文章列表
export async function GET(request: NextRequest) {
    try {
        validateMethod(request, ['GET']);

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const categoryId = searchParams.get('categoryId') || '';
        const tagId = searchParams.get('tagId') || '';
        const published = searchParams.get('published');
        const authorId = searchParams.get('authorId') || '';

        // 分页参数验证
        if (page < 1 || limit < 1 || limit > 100) {
            return createApiResponse({ error: 'Invalid pagination parameters' }, 400);
        }

        const skip = (page - 1) * limit;

        // 构建查询条件
        const where: any = {};

        // 搜索条件
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { summary: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } }
            ];
        }

        // 分类过滤
        if (categoryId) {
            where.categoryId = categoryId;
        }

        // 标签过滤
        if (tagId) {
            where.tags = {
                some: { id: tagId }
            };
        }

        // 发布状态过滤
        if (published !== null) {
            where.published = published === 'true';
        } else {
            // 默认只显示已发布的文章，添加状态过滤
            where.AND = [
                { published: true },
                {
                    OR: [
                        { status: 'PUBLISHED' },
                        { status: { equals: null } } // 兼容旧数据
                    ]
                }
            ];
        }

        // 作者过滤
        if (authorId) {
            where.authorId = authorId;
        }

        // 获取文章列表
        const [articles, totalCount] = await Promise.all([
            prisma.article.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    summary: true,
                    published: true,
                    featuredImage: true,
                    viewCount: true,
                    createdAt: true,
                    updatedAt: true,
                    publishedAt: true,
                    author: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            avatar: true
                        }
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true
                        }
                    },
                    tags: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            color: true
                        }
                    },
                    _count: {
                        select: {
                            comments: true
                        }
                    }
                }
            }),
            prisma.article.count({ where })
        ]);

        return createApiResponse({
            articles,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNext: page * limit < totalCount,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        return handleApiError(error);
    }
}

// 创建文章
export async function POST(request: NextRequest) {
    try {
        validateMethod(request, ['POST']);

        const user = await requireAuth(request);

        const body = await parseRequestBody<{
            title: string;
            content: string;
            summary?: string;
            featuredImage?: string;
            published?: boolean;
            categoryId?: string;
            tagIds?: string[];
            slug?: string;
        }>(request);

        // 验证必填字段
        validateFields(body, ['title', 'content']);

        // 验证字段长度
        if (body.title.length < 5 || body.title.length > 200) {
            return createApiResponse({ error: 'Title must be between 5 and 200 characters' }, 400);
        }

        if (body.content.length < 50) {
            return createApiResponse({ error: 'Content must be at least 50 characters' }, 400);
        }

        if (body.summary && body.summary.length > 500) {
            return createApiResponse({ error: 'Summary must be less than 500 characters' }, 400);
        }

        // 生成 slug
        let slug = body.slug || body.title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        // 确保 slug 唯一
        let slugCounter = 0;
        let uniqueSlug = slug;

        while (await prisma.article.findUnique({ where: { slug: uniqueSlug } })) {
            slugCounter++;
            uniqueSlug = `${slug}-${slugCounter}`;
        }

        // 验证分类是否存在
        if (body.categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: body.categoryId }
            });

            if (!category) {
                return createApiResponse({ error: 'Category not found' }, 404);
            }
        }

        // 验证标签是否存在
        if (body.tagIds && body.tagIds.length > 0) {
            const tags = await prisma.tag.findMany({
                where: { id: { in: body.tagIds } }
            });

            if (tags.length !== body.tagIds.length) {
                return createApiResponse({ error: 'One or more tags not found' }, 404);
            }
        }

        // 创建文章
        const article = await prisma.article.create({
            data: {
                title: body.title,
                slug: uniqueSlug,
                content: body.content,
                summary: body.summary || body.content.substring(0, 200) + '...',
                featuredImage: body.featuredImage,
                published: body.published || false,
                publishedAt: body.published ? new Date() : null,
                authorId: user.id,
                categoryId: body.categoryId,
                tags: body.tagIds ? {
                    connect: body.tagIds.map(id => ({ id }))
                } : undefined
            },
            select: {
                id: true,
                title: true,
                slug: true,
                summary: true,
                published: true,
                featuredImage: true,
                viewCount: true,
                createdAt: true,
                updatedAt: true,
                publishedAt: true,
                author: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatar: true
                    }
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                },
                tags: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        color: true
                    }
                }
            }
        });

        return createApiResponse({
            message: 'Article created successfully',
            article
        }, 201);

    } catch (error) {
        return handleApiError(error);
    }
}

// 处理 OPTIONS 请求（CORS）
export async function OPTIONS(request: NextRequest) {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
} 
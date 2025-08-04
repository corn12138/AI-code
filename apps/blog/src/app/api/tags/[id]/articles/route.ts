import {
    createApiResponse,
    handleApiError,
    validateMethod
} from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// 获取特定标签的文章列表
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        validateMethod(request, ['GET']);

        const { id } = await params;

        if (!id) {
            return createApiResponse({ error: 'Tag ID or name is required' }, 400);
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        // 分页参数验证
        if (page < 1 || limit < 1 || limit > 100) {
            return createApiResponse({ error: 'Invalid pagination parameters' }, 400);
        }

        const skip = (page - 1) * limit;

        // 首先查找标签 - 支持 ID、name 或 slug
        const tag = await prisma.tag.findFirst({
            where: {
                OR: [
                    { id: id },
                    { name: id },
                    { slug: id }
                ]
            },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                color: true
            }
        });

        if (!tag) {
            return createApiResponse({ error: 'Tag not found' }, 404);
        }

        // 构建查询条件
        const where: any = {
            tags: {
                some: { id: tag.id }
            },
            published: true
        };

        // 搜索条件
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { summary: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } }
            ];
        }

        // 获取文章列表
        const [articles, totalCount] = await Promise.all([
            prisma.article.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    summary: true,
                    featuredImage: true,
                    publishedAt: true,
                    viewCount: true,
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
                },
                orderBy: { publishedAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.article.count({ where })
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return createApiResponse({
            tag,
            articles,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

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
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
} 
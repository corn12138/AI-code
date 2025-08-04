import {
    createApiResponse,
    handleApiError,
    validateMethod
} from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// 获取特定文章的评论
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        validateMethod(request, ['GET']);

        const { id } = await params;

        if (!id) {
            return createApiResponse({ error: 'Article ID is required' }, 400);
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const sortBy = searchParams.get('sortBy') || 'newest'; // newest, oldest

        // 分页参数验证
        if (page < 1 || limit < 1 || limit > 100) {
            return createApiResponse({ error: 'Invalid pagination parameters' }, 400);
        }

        const skip = (page - 1) * limit;

        // 验证文章是否存在且已发布
        const article = await prisma.article.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                slug: true,
                published: true,
                author: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true
                    }
                }
            }
        });

        if (!article) {
            return createApiResponse({ error: 'Article not found' }, 404);
        }

        if (!article.published) {
            return createApiResponse({ error: 'Article not published' }, 404);
        }

            // 排序设置
    const orderBy = sortBy === 'oldest' ? { createdAt: 'asc' as const } : { createdAt: 'desc' as const };

        // 获取顶级评论（没有父评论的评论）
        const [topLevelComments, totalCount] = await Promise.all([
            prisma.comment.findMany({
                where: {
                    articleId: id,
                    parentId: null
                },
                skip,
                take: limit,
                orderBy,
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    updatedAt: true,
                    author: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            avatar: true
                        }
                    },
                    replies: {
                        select: {
                            id: true,
                            content: true,
                            createdAt: true,
                            updatedAt: true,
                            author: {
                                select: {
                                    id: true,
                                    username: true,
                                    fullName: true,
                                    avatar: true
                                }
                            },
                            replies: {
                                select: {
                                    id: true,
                                    content: true,
                                    createdAt: true,
                                    updatedAt: true,
                                    author: {
                                        select: {
                                            id: true,
                                            username: true,
                                            fullName: true,
                                            avatar: true
                                        }
                                    }
                                },
                                orderBy: { createdAt: 'asc' }
                            }
                        },
                        orderBy: { createdAt: 'asc' }
                    },
                    _count: {
                        select: {
                            replies: true
                        }
                    }
                }
            }),
            prisma.comment.count({
                where: {
                    articleId: id,
                    parentId: null
                }
            })
        ]);

        // 获取文章的总评论数（包括回复）
        const totalCommentsCount = await prisma.comment.count({
            where: { articleId: id }
        });

        return createApiResponse({
            article: {
                id: article.id,
                title: article.title,
                slug: article.slug,
                author: article.author
            },
            comments: topLevelComments,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNext: page * limit < totalCount,
                hasPrev: page > 1
            },
            stats: {
                totalComments: totalCommentsCount,
                topLevelComments: totalCount
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
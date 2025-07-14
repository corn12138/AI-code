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

// 获取评论列表
export async function GET(request: NextRequest) {
    try {
        validateMethod(request, ['GET']);

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const articleId = searchParams.get('articleId') || '';
        const parentId = searchParams.get('parentId') || '';
        const authorId = searchParams.get('authorId') || '';

        // 分页参数验证
        if (page < 1 || limit < 1 || limit > 100) {
            return createApiResponse({ error: 'Invalid pagination parameters' }, 400);
        }

        const skip = (page - 1) * limit;

        // 构建查询条件
        const where: any = {};

        if (articleId) {
            where.articleId = articleId;
        }

        if (parentId) {
            where.parentId = parentId;
        } else if (parentId === '') {
            // 获取顶级评论
            where.parentId = null;
        }

        if (authorId) {
            where.authorId = authorId;
        }

        // 获取评论列表
        const [comments, totalCount] = await Promise.all([
            prisma.comment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
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
                    article: {
                        select: {
                            id: true,
                            title: true,
                            slug: true
                        }
                    },
                    parent: {
                        select: {
                            id: true,
                            content: true,
                            author: {
                                select: {
                                    id: true,
                                    username: true,
                                    fullName: true
                                }
                            }
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
                        orderBy: { createdAt: 'asc' },
                        take: 5 // 限制回复数量
                    },
                    _count: {
                        select: {
                            replies: true
                        }
                    }
                }
            }),
            prisma.comment.count({ where })
        ]);

        return createApiResponse({
            comments,
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

// 创建评论
export async function POST(request: NextRequest) {
    try {
        validateMethod(request, ['POST']);

        const user = await requireAuth(request);

        const body = await parseRequestBody<{
            content: string;
            articleId: string;
            parentId?: string;
        }>(request);

        // 验证必填字段
        validateFields(body, ['content', 'articleId']);

        // 验证评论内容
        if (body.content.length < 5) {
            return createApiResponse({ error: 'Comment must be at least 5 characters long' }, 400);
        }

        if (body.content.length > 1000) {
            return createApiResponse({ error: 'Comment must be less than 1000 characters' }, 400);
        }

        // 验证文章是否存在且已发布
        const article = await prisma.article.findUnique({
            where: { id: body.articleId },
            select: { id: true, published: true }
        });

        if (!article) {
            return createApiResponse({ error: 'Article not found' }, 404);
        }

        if (!article.published) {
            return createApiResponse({ error: 'Cannot comment on unpublished article' }, 400);
        }

        // 如果是回复评论，验证父评论是否存在
        if (body.parentId) {
            const parentComment = await prisma.comment.findUnique({
                where: { id: body.parentId },
                select: { id: true, articleId: true }
            });

            if (!parentComment) {
                return createApiResponse({ error: 'Parent comment not found' }, 404);
            }

            if (parentComment.articleId !== body.articleId) {
                return createApiResponse({ error: 'Parent comment must be from the same article' }, 400);
            }
        }

        // 创建评论
        const comment = await prisma.comment.create({
            data: {
                content: body.content,
                authorId: user.id,
                articleId: body.articleId,
                parentId: body.parentId || null
            },
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
                article: {
                    select: {
                        id: true,
                        title: true,
                        slug: true
                    }
                },
                parent: {
                    select: {
                        id: true,
                        author: {
                            select: {
                                id: true,
                                username: true,
                                fullName: true
                            }
                        }
                    }
                }
            }
        });

        return createApiResponse({
            message: 'Comment created successfully',
            comment
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
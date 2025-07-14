import {
    checkResourceOwnership,
    createApiResponse,
    handleApiError,
    parseRequestBody,
    validateMethod
} from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// 获取单个评论
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        validateMethod(request, ['GET']);

        const { id } = params;

        if (!id) {
            return createApiResponse({ error: 'Comment ID is required' }, 400);
        }

        const comment = await prisma.comment.findUnique({
            where: { id },
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
                        slug: true,
                        published: true
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
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!comment) {
            return createApiResponse({ error: 'Comment not found' }, 404);
        }

        // 检查文章是否已发布（只有已发布的文章的评论才能公开查看）
        if (!comment.article.published) {
            return createApiResponse({ error: 'Comment not found' }, 404);
        }

        return createApiResponse({
            comment
        });

    } catch (error) {
        return handleApiError(error);
    }
}

// 更新评论
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        validateMethod(request, ['PATCH']);

        const { id } = params;

        if (!id) {
            return createApiResponse({ error: 'Comment ID is required' }, 400);
        }

        // 获取当前评论信息
        const existingComment = await prisma.comment.findUnique({
            where: { id },
            select: { id: true, authorId: true, createdAt: true }
        });

        if (!existingComment) {
            return createApiResponse({ error: 'Comment not found' }, 404);
        }

        // 检查是否是评论作者或管理员
        const user = await checkResourceOwnership(request, existingComment.authorId, ['admin']);

        // 检查是否在允许编辑的时间范围内（15分钟内）
        const now = new Date();
        const timeDiff = now.getTime() - existingComment.createdAt.getTime();
        const fifteenMinutes = 15 * 60 * 1000;

        if (timeDiff > fifteenMinutes && !user.roles.includes('admin')) {
            return createApiResponse({ error: 'Comments can only be edited within 15 minutes of creation' }, 403);
        }

        const body = await parseRequestBody<{
            content: string;
        }>(request);

        // 验证评论内容
        if (!body.content || body.content.length < 5) {
            return createApiResponse({ error: 'Comment must be at least 5 characters long' }, 400);
        }

        if (body.content.length > 1000) {
            return createApiResponse({ error: 'Comment must be less than 1000 characters' }, 400);
        }

        // 更新评论
        const updatedComment = await prisma.comment.update({
            where: { id },
            data: {
                content: body.content
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
                }
            }
        });

        return createApiResponse({
            message: 'Comment updated successfully',
            comment: updatedComment
        });

    } catch (error) {
        return handleApiError(error);
    }
}

// 删除评论
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        validateMethod(request, ['DELETE']);

        const { id } = params;

        if (!id) {
            return createApiResponse({ error: 'Comment ID is required' }, 400);
        }

        // 获取当前评论信息
        const existingComment = await prisma.comment.findUnique({
            where: { id },
            select: {
                id: true,
                authorId: true,
                createdAt: true,
                _count: {
                    select: { replies: true }
                }
            }
        });

        if (!existingComment) {
            return createApiResponse({ error: 'Comment not found' }, 404);
        }

        // 检查是否是评论作者或管理员
        const user = await checkResourceOwnership(request, existingComment.authorId, ['admin']);

        // 检查是否在允许删除的时间范围内（30分钟内）
        const now = new Date();
        const timeDiff = now.getTime() - existingComment.createdAt.getTime();
        const thirtyMinutes = 30 * 60 * 1000;

        if (timeDiff > thirtyMinutes && !user.roles.includes('admin')) {
            return createApiResponse({ error: 'Comments can only be deleted within 30 minutes of creation' }, 403);
        }

        // 如果有回复，不允许删除（除非是管理员）
        if (existingComment._count.replies > 0 && !user.roles.includes('admin')) {
            return createApiResponse({ error: 'Cannot delete comment with replies' }, 400);
        }

        // 删除评论（由于外键关系，相关回复也会被删除）
        await prisma.comment.delete({
            where: { id }
        });

        return createApiResponse({
            message: 'Comment deleted successfully'
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
            'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
} 
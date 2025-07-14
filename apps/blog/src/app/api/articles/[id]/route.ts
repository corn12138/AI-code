import {
    checkResourceOwnership,
    createApiResponse,
    getCurrentUser,
    handleApiError,
    parseRequestBody,
    validateMethod
} from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// 获取单个文章
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        validateMethod(request, ['GET']);

        const { id } = params;

        if (!id) {
            return createApiResponse({ error: 'Article ID is required' }, 400);
        }

        const currentUser = await getCurrentUser(request);

        // 查找文章
        const article = await prisma.article.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                slug: true,
                content: true,
                summary: true,
                published: true,
                featuredImage: true,
                viewCount: true,
                createdAt: true,
                updatedAt: true,
                publishedAt: true,
                authorId: true,
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
                        slug: true,
                        description: true
                    }
                },
                tags: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        color: true,
                        description: true
                    }
                },
                comments: {
                    where: { parentId: null }, // 只获取顶级评论
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
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!article) {
            return createApiResponse({ error: 'Article not found' }, 404);
        }

        // 检查访问权限
        if (!article.published && (!currentUser || currentUser.id !== article.authorId)) {
            // 未发布的文章只有作者和管理员可以访问
            if (!currentUser?.roles.includes('admin')) {
                return createApiResponse({ error: 'Article not found' }, 404);
            }
        }

        // 增加浏览量（如果不是作者本人）
        if (currentUser?.id !== article.authorId) {
            await prisma.article.update({
                where: { id },
                data: { viewCount: { increment: 1 } }
            });
        }

        return createApiResponse({
            article
        });

    } catch (error) {
        return handleApiError(error);
    }
}

// 更新文章
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        validateMethod(request, ['PATCH']);

        const { id } = params;

        if (!id) {
            return createApiResponse({ error: 'Article ID is required' }, 400);
        }

        // 获取当前文章信息
        const existingArticle = await prisma.article.findUnique({
            where: { id },
            select: { id: true, authorId: true, published: true }
        });

        if (!existingArticle) {
            return createApiResponse({ error: 'Article not found' }, 404);
        }

        // 检查权限
        const user = await checkResourceOwnership(request, existingArticle.authorId, ['admin', 'editor']);

        const body = await parseRequestBody<{
            title?: string;
            content?: string;
            summary?: string;
            featuredImage?: string;
            published?: boolean;
            categoryId?: string;
            tagIds?: string[];
            slug?: string;
        }>(request);

        // 验证字段
        const updateData: any = {};

        if (body.title !== undefined) {
            if (body.title.length < 5 || body.title.length > 200) {
                return createApiResponse({ error: 'Title must be between 5 and 200 characters' }, 400);
            }
            updateData.title = body.title;
        }

        if (body.content !== undefined) {
            if (body.content.length < 50) {
                return createApiResponse({ error: 'Content must be at least 50 characters' }, 400);
            }
            updateData.content = body.content;
        }

        if (body.summary !== undefined) {
            if (body.summary.length > 500) {
                return createApiResponse({ error: 'Summary must be less than 500 characters' }, 400);
            }
            updateData.summary = body.summary;
        }

        if (body.featuredImage !== undefined) {
            updateData.featuredImage = body.featuredImage;
        }

        if (body.published !== undefined) {
            updateData.published = body.published;
            // 如果是发布文章，设置发布时间
            if (body.published && !existingArticle.published) {
                updateData.publishedAt = new Date();
            } else if (!body.published && existingArticle.published) {
                updateData.publishedAt = null;
            }
        }

        if (body.categoryId !== undefined) {
            if (body.categoryId) {
                const category = await prisma.category.findUnique({
                    where: { id: body.categoryId }
                });
                if (!category) {
                    return createApiResponse({ error: 'Category not found' }, 404);
                }
            }
            updateData.categoryId = body.categoryId;
        }

        // 处理 slug 更新
        if (body.slug !== undefined) {
            let slug = body.slug || body.title?.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();

            if (slug) {
                // 确保 slug 唯一（排除当前文章）
                let slugCounter = 0;
                let uniqueSlug = slug;

                while (await prisma.article.findFirst({
                    where: { slug: uniqueSlug, id: { not: id } }
                })) {
                    slugCounter++;
                    uniqueSlug = `${slug}-${slugCounter}`;
                }

                updateData.slug = uniqueSlug;
            }
        }

        // 处理标签更新
        if (body.tagIds !== undefined) {
            if (body.tagIds.length > 0) {
                const tags = await prisma.tag.findMany({
                    where: { id: { in: body.tagIds } }
                });

                if (tags.length !== body.tagIds.length) {
                    return createApiResponse({ error: 'One or more tags not found' }, 404);
                }

                updateData.tags = {
                    set: body.tagIds.map(id => ({ id }))
                };
            } else {
                updateData.tags = {
                    set: []
                };
            }
        }

        // 更新文章
        const updatedArticle = await prisma.article.update({
            where: { id },
            data: updateData,
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
            message: 'Article updated successfully',
            article: updatedArticle
        });

    } catch (error) {
        return handleApiError(error);
    }
}

// 删除文章
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        validateMethod(request, ['DELETE']);

        const { id } = params;

        if (!id) {
            return createApiResponse({ error: 'Article ID is required' }, 400);
        }

        // 获取当前文章信息
        const existingArticle = await prisma.article.findUnique({
            where: { id },
            select: { id: true, authorId: true, title: true }
        });

        if (!existingArticle) {
            return createApiResponse({ error: 'Article not found' }, 404);
        }

        // 检查权限
        await checkResourceOwnership(request, existingArticle.authorId, ['admin']);

        // 删除文章（由于外键关系，相关评论也会被删除）
        await prisma.article.delete({
            where: { id }
        });

        return createApiResponse({
            message: 'Article deleted successfully'
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
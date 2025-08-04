import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// 获取单个文章
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth(request);
        const { id } = await params;

        const article = await prisma.article.findFirst({
            where: {
                id: id,
                authorId: user.id  // 只能查看自己的文章
            },
            include: {
                category: true,
                tags: true,
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            }
        });

        if (!article) {
            return new Response(JSON.stringify({
                error: 'Article not found'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ article }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get article error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to fetch article'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// 更新文章（包括草稿保存）
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth(request);
        const { id } = await params;
        const body = await request.json();

        const {
            title,
            content,
            draftContent,
            summary,
            status,
            categoryId,
            tagIds,
            metaTitle,
            metaDescription,
            keywords,
            featuredImage
        } = body;

        // 检查文章是否存在且属于当前用户
        const existingArticle = await prisma.article.findFirst({
            where: {
                id: id,
                authorId: user.id
            }
        });

        if (!existingArticle) {
            return new Response(JSON.stringify({
                error: 'Article not found'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 准备更新数据
        const updateData: any = {
            lastSavedAt: new Date(),
            version: (existingArticle.version || 0) + 1
        };

        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (draftContent !== undefined) updateData.draftContent = draftContent;
        if (summary !== undefined) updateData.summary = summary;
        if (status !== undefined) updateData.status = status;
        if (categoryId !== undefined) updateData.categoryId = categoryId;
        if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
        if (metaDescription !== undefined) updateData.metaDescription = metaDescription;

        // 处理keywords字段（支持字符串和数组格式）
        if (keywords !== undefined) {
            if (typeof keywords === 'string') {
                updateData.keywords = keywords.trim() || null;
            } else if (Array.isArray(keywords)) {
                const validKeywords = keywords
                    .filter(k => typeof k === 'string' && k.trim())
                    .map(k => k.trim());
                updateData.keywords = validKeywords.length > 0 ? validKeywords.join(', ') : null;
            } else {
                updateData.keywords = null;
            }
        }

        if (featuredImage !== undefined) updateData.featuredImage = featuredImage;

        // 如果状态改为已发布，设置发布时间
        if (status === 'PUBLISHED' && existingArticle.status !== 'PUBLISHED') {
            updateData.publishedAt = new Date();
        }

        // 处理标签关联
        if (tagIds !== undefined) {
            updateData.tags = {
                set: [], // 清除现有关联
                connect: tagIds.map((id: string) => ({ id }))
            };
        }

        // 更新文章
        const updatedArticle = await prisma.article.update({
            where: { id: id },
            data: updateData,
            include: {
                category: true,
                tags: true,
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            }
        });

        return new Response(JSON.stringify({
            message: 'Article updated successfully',
            article: updatedArticle
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Update article error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to update article'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// 删除文章
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth(request);
        const { id } = await params;

        // 检查文章是否存在且属于当前用户
        const existingArticle = await prisma.article.findFirst({
            where: {
                id: id,
                authorId: user.id
            }
        });

        if (!existingArticle) {
            return new Response(JSON.stringify({
                error: 'Article not found'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 软删除：移动到回收站
        await prisma.article.update({
            where: { id: id },
            data: {
                status: 'TRASH',
                lastSavedAt: new Date()
            }
        });

        return new Response(JSON.stringify({
            message: 'Article moved to trash successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Delete article error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to delete article'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

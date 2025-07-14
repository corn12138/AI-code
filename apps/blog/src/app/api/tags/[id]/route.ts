import {
    createApiResponse,
    handleApiError,
    parseRequestBody,
    requireRole,
    validateMethod
} from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// 获取单个标签
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        validateMethod(request, ['GET']);

        const { id } = params;

        if (!id) {
            return createApiResponse({ error: 'Tag ID is required' }, 400);
        }

        // 支持通过 ID、name 或 slug 查找标签
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
                color: true,
                createdAt: true,
                updatedAt: true,
                articles: {
                    where: { published: true },
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
                        }
                    },
                    orderBy: { publishedAt: 'desc' },
                    take: 10
                },
                _count: {
                    select: {
                        articles: {
                            where: { published: true }
                        }
                    }
                }
            }
        });

        if (!tag) {
            return createApiResponse({ error: 'Tag not found' }, 404);
        }

        return createApiResponse({
            tag
        });

    } catch (error) {
        return handleApiError(error);
    }
}

// 更新标签
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        validateMethod(request, ['PATCH']);

        const { id } = params;

        if (!id) {
            return createApiResponse({ error: 'Tag ID is required' }, 400);
        }

        // 需要编辑权限或管理员权限
        const user = await requireRole(request, 'editor');

        // 检查标签是否存在 - 支持通过 ID、name 或 slug 查找
        const existingTag = await prisma.tag.findFirst({
            where: {
                OR: [
                    { id: id },
                    { name: id },
                    { slug: id }
                ]
            },
            select: { id: true, name: true }
        });

        if (!existingTag) {
            return createApiResponse({ error: 'Tag not found' }, 404);
        }

        // 使用实际的标签 ID 进行后续操作
        const actualTagId = existingTag.id;

        const body = await parseRequestBody<{
            name?: string;
            description?: string;
            color?: string;
            slug?: string;
        }>(request);

        // 验证字段
        const updateData: any = {};

        if (body.name !== undefined) {
            if (body.name.length < 2 || body.name.length > 50) {
                return createApiResponse({ error: 'Tag name must be between 2 and 50 characters' }, 400);
            }

            // 检查标签名是否已存在（排除当前标签）
            const nameExists = await prisma.tag.findFirst({
                where: { name: body.name, id: { not: actualTagId } }
            });

            if (nameExists) {
                return createApiResponse({ error: 'Tag name already exists' }, 409);
            }

            updateData.name = body.name;
        }

        if (body.description !== undefined) {
            if (body.description.length > 200) {
                return createApiResponse({ error: 'Description must be less than 200 characters' }, 400);
            }
            updateData.description = body.description || null;
        }

        if (body.color !== undefined) {
            if (body.color && !/^#[0-9A-F]{6}$/i.test(body.color)) {
                return createApiResponse({ error: 'Color must be a valid hex color (e.g., #FF0000)' }, 400);
            }
            updateData.color = body.color || null;
        }

        // 处理 slug 更新
        if (body.slug !== undefined) {
            let slug = body.slug || body.name?.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();

            if (slug) {
                // 确保 slug 唯一（排除当前标签）
                let slugCounter = 0;
                let uniqueSlug = slug;

                while (await prisma.tag.findFirst({
                    where: { slug: uniqueSlug, id: { not: actualTagId } }
                })) {
                    slugCounter++;
                    uniqueSlug = `${slug}-${slugCounter}`;
                }

                updateData.slug = uniqueSlug;
            }
        }

        // 更新标签
        const updatedTag = await prisma.tag.update({
            where: { id: actualTagId },
            data: updateData,
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                color: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return createApiResponse({
            message: 'Tag updated successfully',
            tag: updatedTag
        });

    } catch (error) {
        return handleApiError(error);
    }
}

// 删除标签
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        validateMethod(request, ['DELETE']);

        const { id } = params;

        if (!id) {
            return createApiResponse({ error: 'Tag ID is required' }, 400);
        }

        // 需要管理员权限
        const user = await requireRole(request, 'admin');

        // 检查标签是否存在 - 支持通过 ID、name 或 slug 查找
        const existingTag = await prisma.tag.findFirst({
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
                _count: {
                    select: {
                        articles: true
                    }
                }
            }
        });

        if (!existingTag) {
            return createApiResponse({ error: 'Tag not found' }, 404);
        }

        // 使用实际的标签 ID 进行后续操作
        const actualTagId = existingTag.id;

        // 检查是否有文章关联此标签
        if (existingTag._count.articles > 0) {
            return createApiResponse({
                error: 'Cannot delete tag that is associated with articles',
                details: `This tag is used by ${existingTag._count.articles} article(s)`
            }, 409);
        }

        // 删除标签
        await prisma.tag.delete({
            where: { id: actualTagId }
        });

        return createApiResponse({
            message: 'Tag deleted successfully'
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
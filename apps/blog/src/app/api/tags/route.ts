import {
    createApiResponse,
    handleApiError,
    parseRequestBody,
    requireRole,
    validateFields,
    validateMethod
} from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// 获取标签列表
export async function GET(request: NextRequest) {
    try {
        validateMethod(request, ['GET']);

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const includeCount = searchParams.get('includeCount') === 'true';

        // 构建查询条件
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const tags = await prisma.tag.findMany({
            where,
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                color: true,
                createdAt: true,
                updatedAt: true,
                ...(includeCount && {
                    _count: {
                        select: {
                            articles: {
                                where: { published: true }
                            }
                        }
                    }
                })
            },
            orderBy: { name: 'asc' }
        });

        return createApiResponse({
            tags
        });

    } catch (error) {
        return handleApiError(error);
    }
}

// 创建标签
export async function POST(request: NextRequest) {
    try {
        validateMethod(request, ['POST']);

        // 需要编辑权限或管理员权限
        const user = await requireRole(request, 'editor');

        const body = await parseRequestBody<{
            name: string;
            description?: string;
            color?: string;
            slug?: string;
        }>(request);

        // 验证必填字段
        validateFields(body, ['name']);

        // 验证字段
        if (body.name.length < 2 || body.name.length > 50) {
            return createApiResponse({ error: 'Tag name must be between 2 and 50 characters' }, 400);
        }

        if (body.description && body.description.length > 200) {
            return createApiResponse({ error: 'Description must be less than 200 characters' }, 400);
        }

        // 检查标签名是否已存在
        const existingTag = await prisma.tag.findUnique({
            where: { name: body.name }
        });

        if (existingTag) {
            return createApiResponse({ error: 'Tag name already exists' }, 409);
        }

        // 生成 slug
        let slug = body.slug || body.name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        // 确保 slug 唯一
        let slugCounter = 0;
        let uniqueSlug = slug;

        while (await prisma.tag.findUnique({ where: { slug: uniqueSlug } })) {
            slugCounter++;
            uniqueSlug = `${slug}-${slugCounter}`;
        }

        // 验证颜色格式
        if (body.color && !/^#[0-9A-F]{6}$/i.test(body.color)) {
            return createApiResponse({ error: 'Color must be a valid hex color (e.g., #FF0000)' }, 400);
        }

        // 创建标签
        const tag = await prisma.tag.create({
            data: {
                name: body.name,
                slug: uniqueSlug,
                description: body.description || null,
                color: body.color || null
            },
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
            message: 'Tag created successfully',
            tag
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

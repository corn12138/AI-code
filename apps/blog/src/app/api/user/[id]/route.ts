import {
    createApiResponse,
    getCurrentUser,
    handleApiError,
    validateMethod
} from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// 获取用户信息（通过 ID）
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        validateMethod(request, ['GET']);

        const { id } = await params;

        if (!id) {
            return createApiResponse({ error: 'User ID is required' }, 400);
        }

        // 获取当前用户（可选，用于权限检查）
        const currentUser = await getCurrentUser(request);

        // 查找目标用户
        const targetUser = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: currentUser?.id === id, // 只有本人能看到邮箱
                username: true,
                fullName: true,
                bio: true,
                avatar: true,
                roles: currentUser?.roles.includes('admin'), // 只有管理员能看到角色
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        articles: {
                            where: { published: true } // 只统计已发布的文章
                        },
                        comments: true,
                        lowcodePages: {
                            where: { published: true } // 只统计已发布的页面
                        }
                    }
                }
            }
        });

        if (!targetUser) {
            return createApiResponse({ error: 'User not found' }, 404);
        }

        // 构建响应数据
        const responseData: any = {
            id: targetUser.id,
            username: targetUser.username,
            fullName: targetUser.fullName,
            bio: targetUser.bio,
            avatar: targetUser.avatar,
            createdAt: targetUser.createdAt,
            updatedAt: targetUser.updatedAt,
            stats: {
                articlesCount: targetUser._count.articles,
                commentsCount: targetUser._count.comments,
                lowcodePagesCount: targetUser._count.lowcodePages
            }
        };

        // 如果是本人访问，添加敏感信息
        if (currentUser?.id === id) {
            responseData.email = targetUser.email;
            responseData.roles = targetUser.roles;
        }

        // 如果是管理员访问，添加管理员可见信息
        if (currentUser?.roles.includes('admin')) {
            responseData.email = targetUser.email;
            responseData.roles = targetUser.roles;
        }

        return createApiResponse({
            user: responseData
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
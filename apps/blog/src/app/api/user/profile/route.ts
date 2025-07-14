import {
    createApiResponse,
    handleApiError,
    parseRequestBody,
    requireAuth,
    validateMethod
} from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// 获取用户个人资料
export async function GET(request: NextRequest) {
    try {
        validateMethod(request, ['GET']);

        const user = await requireAuth(request);

        // 获取用户详细信息
        const userProfile = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                email: true,
                username: true,
                fullName: true,
                bio: true,
                avatar: true,
                roles: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        articles: true,
                        comments: true,
                        lowcodePages: true
                    }
                }
            }
        });

        if (!userProfile) {
            return createApiResponse({ error: 'User not found' }, 404);
        }

        return createApiResponse({
            user: {
                id: userProfile.id,
                email: userProfile.email,
                username: userProfile.username,
                fullName: userProfile.fullName,
                bio: userProfile.bio,
                avatar: userProfile.avatar,
                roles: userProfile.roles,
                createdAt: userProfile.createdAt,
                updatedAt: userProfile.updatedAt,
                stats: {
                    articlesCount: userProfile._count.articles,
                    commentsCount: userProfile._count.comments,
                    lowcodePagesCount: userProfile._count.lowcodePages
                }
            }
        });

    } catch (error) {
        return handleApiError(error);
    }
}

// 更新用户个人资料
export async function PATCH(request: NextRequest) {
    try {
        validateMethod(request, ['PATCH']);

        const user = await requireAuth(request);

        const body = await parseRequestBody<{
            fullName?: string;
            bio?: string;
            avatar?: string;
        }>(request);

        // 验证字段
        const updateData: any = {};

        if (body.fullName !== undefined) {
            if (body.fullName.length > 50) {
                return createApiResponse({ error: 'Full name must be less than 50 characters' }, 400);
            }
            updateData.fullName = body.fullName;
        }

        if (body.bio !== undefined) {
            if (body.bio.length > 500) {
                return createApiResponse({ error: 'Bio must be less than 500 characters' }, 400);
            }
            updateData.bio = body.bio;
        }

        if (body.avatar !== undefined) {
            updateData.avatar = body.avatar;
        }

        // 更新用户信息
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
            select: {
                id: true,
                email: true,
                username: true,
                fullName: true,
                bio: true,
                avatar: true,
                roles: true,
                updatedAt: true
            }
        });

        return createApiResponse({
            message: 'Profile updated successfully',
            user: updatedUser
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
            'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
} 
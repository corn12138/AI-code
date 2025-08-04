import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// 获取公开的单个文章（无需认证）
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 支持通过ID或slug查询
        const article = await prisma.article.findFirst({
            where: {
                OR: [
                    { id: id },
                    { slug: id }
                ],
                // 只查询已发布的文章
                published: true,
                status: 'PUBLISHED'
            },
            include: {
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
                },
                author: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatar: true,
                        bio: true
                    }
                },
                _count: {
                    select: {
                        comments: true
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

        // 增加浏览量
        await prisma.article.update({
            where: { id: article.id },
            data: { viewCount: { increment: 1 } }
        });

        return new Response(JSON.stringify({
            ...article,
            commentCount: article._count.comments
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get public article error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to fetch article'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
} 
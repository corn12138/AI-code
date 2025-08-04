import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// 发布文章
export async function POST(
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

        // 准备更新数据
        const updateData: any = {
            status: 'PUBLISHED',
            publishedAt: new Date(),
            lastSavedAt: new Date(),
            published: true // 兼容性
        };

        // 如果文章没有slug，则生成一个
        if (!existingArticle.slug) {
            let slug = existingArticle.title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();

            // 确保 slug 唯一
            let slugCounter = 0;
            let uniqueSlug = slug;

            while (await prisma.article.findUnique({ where: { slug: uniqueSlug } })) {
                slugCounter++;
                uniqueSlug = `${slug}-${slugCounter}`;
            }

            updateData.slug = uniqueSlug;
        }

        // 发布文章
        const publishedArticle = await prisma.article.update({
            where: { id: id },
            data: updateData,
            include: {
                category: true,
                tags: true
            }
        });

        return new Response(JSON.stringify({
            message: 'Article published successfully',
            article: publishedArticle
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Publish article error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to publish article'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

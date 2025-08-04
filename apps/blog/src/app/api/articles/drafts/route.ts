import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// 获取草稿列表
export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request);

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search');

        const skip = (page - 1) * limit;

        // 构建查询条件
        const whereCondition: any = {
            authorId: user.id,
            status: {
                in: ['DRAFT', 'SCHEDULED']
            }
        };

        if (search) {
            whereCondition.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { draftContent: { contains: search, mode: 'insensitive' } }
            ];
        }

        // 查询草稿
        const [drafts, total] = await Promise.all([
            prisma.article.findMany({
                where: whereCondition,
                include: {
                    category: true,
                    tags: true
                },
                orderBy: {
                    lastSavedAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.article.count({ where: whereCondition })
        ]);

        return new Response(JSON.stringify({
            drafts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get drafts error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to fetch drafts'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// 创建或保存草稿
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();

        const {
            title,
            content,
            draftContent,
            summary,
            categoryId,
            tagIds,
            metaTitle,
            metaDescription,
            keywords,
            featuredImage,
            scheduledAt
        } = body;

        // 数据验证和清理
        const cleanTitle = title && title.trim() ? title.trim() : '无标题草稿';
        const cleanContent = content && typeof content === 'string' ? content : '';
        const cleanDraftContent = draftContent && typeof draftContent === 'string' ? draftContent : cleanContent;

        // 验证categoryId是否存在
        let validCategoryId = null;
        if (categoryId && typeof categoryId === 'string') {
            const categoryExists = await prisma.category.findUnique({
                where: { id: categoryId }
            });
            if (categoryExists) {
                validCategoryId = categoryId;
            }
        }

        // 验证tagIds是否存在
        let validTagIds: string[] = [];
        if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
            const existingTags = await prisma.tag.findMany({
                where: {
                    id: { in: tagIds.filter(id => typeof id === 'string') }
                },
                select: { id: true }
            });
            validTagIds = existingTags.map(tag => tag.id);
        }

        // 确定文章状态
        const status = scheduledAt ? 'SCHEDULED' : 'DRAFT';

        // 准备创建数据
        const createData: any = {
            title: cleanTitle,
            content: cleanContent,
            draftContent: cleanDraftContent,
            status,
            authorId: user.id,
            lastSavedAt: new Date(),
            version: 1
        };

        // 生成slug
        if (cleanTitle && cleanTitle !== '无标题草稿') {
            let slug = cleanTitle.toLowerCase()
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

            createData.slug = uniqueSlug;
        }

        // 只添加有值的可选字段
        if (summary && typeof summary === 'string' && summary.trim()) {
            createData.summary = summary.trim();
        }
        if (validCategoryId) {
            createData.categoryId = validCategoryId;
        }
        if (metaTitle && typeof metaTitle === 'string' && metaTitle.trim()) {
            createData.metaTitle = metaTitle.trim();
        }
        if (metaDescription && typeof metaDescription === 'string' && metaDescription.trim()) {
            createData.metaDescription = metaDescription.trim();
        }
        if (keywords && typeof keywords === 'string' && keywords.trim()) {
            createData.keywords = keywords.trim();
        }
        // 处理数组类型的keywords（前端发送的格式）
        else if (keywords && Array.isArray(keywords) && keywords.length > 0) {
            const validKeywords = keywords
                .filter(k => typeof k === 'string' && k.trim())
                .map(k => k.trim());
            if (validKeywords.length > 0) {
                createData.keywords = validKeywords.join(', ');
            }
        }
        if (featuredImage && typeof featuredImage === 'string' && featuredImage.trim()) {
            createData.featuredImage = featuredImage.trim();
        }
        if (scheduledAt) {
            try {
                createData.publishedAt = new Date(scheduledAt);
            } catch (e) {
                console.warn('Invalid scheduledAt date:', scheduledAt);
            }
        }

        // 添加标签连接
        if (validTagIds.length > 0) {
            createData.tags = {
                connect: validTagIds.map(id => ({ id }))
            };
        }

        // 创建文章草稿
        const draft = await prisma.article.create({
            data: createData,
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
            message: 'Draft saved successfully',
            draft
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Save draft error:', error);

        // 提供更详细的错误信息
        let errorMessage = 'Failed to save draft';
        if (error instanceof Error) {
            console.error('Error details:', error.message);
            if (error.message.includes('Unique constraint')) {
                errorMessage = 'Draft title already exists';
            } else if (error.message.includes('Foreign key constraint')) {
                errorMessage = 'Invalid category or tag reference';
            }
        }

        return new Response(JSON.stringify({
            error: errorMessage,
            details: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// 更新草稿
export async function PUT(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();

        const {
            id,
            title,
            content,
            draftContent,
            summary,
            categoryId,
            tagIds,
            metaTitle,
            metaDescription,
            keywords,
            featuredImage,
            scheduledAt
        } = body;

        // 验证ID是否提供
        if (!id) {
            return new Response(JSON.stringify({
                error: 'Article ID is required for update'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 检查文章是否存在且属于当前用户
        const existingArticle = await prisma.article.findFirst({
            where: {
                id: id,
                authorId: user.id
            }
        });

        if (!existingArticle) {
            return new Response(JSON.stringify({
                error: 'Article not found or access denied'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 数据验证和清理
        const cleanTitle = title && title.trim() ? title.trim() : '无标题草稿';
        const cleanContent = content && typeof content === 'string' ? content : existingArticle.content;
        const cleanDraftContent = draftContent && typeof draftContent === 'string' ? draftContent : cleanContent;

        // 验证categoryId是否存在
        let validCategoryId = existingArticle.categoryId;
        if (categoryId && typeof categoryId === 'string') {
            const categoryExists = await prisma.category.findUnique({
                where: { id: categoryId }
            });
            if (categoryExists) {
                validCategoryId = categoryId;
            }
        }

        // 验证tagIds是否存在
        let validTagIds: string[] = [];
        if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
            const existingTags = await prisma.tag.findMany({
                where: {
                    id: { in: tagIds.filter(id => typeof id === 'string') }
                },
                select: { id: true }
            });
            validTagIds = existingTags.map(tag => tag.id);
        }

        // 确定文章状态
        const status = scheduledAt ? 'SCHEDULED' : 'DRAFT';

        // 准备更新数据
        const updateData: any = {
            title: cleanTitle,
            content: cleanContent,
            draftContent: cleanDraftContent,
            status,
            lastSavedAt: new Date(),
            version: (existingArticle.version || 0) + 1
        };

        // 如果标题变化了，重新生成slug
        if (cleanTitle !== existingArticle.title && cleanTitle !== '无标题草稿') {
            let slug = cleanTitle.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();

            // 确保 slug 唯一
            let slugCounter = 0;
            let uniqueSlug = slug;

            while (await prisma.article.findUnique({ where: { slug: uniqueSlug, NOT: { id: id } } })) {
                slugCounter++;
                uniqueSlug = `${slug}-${slugCounter}`;
            }

            updateData.slug = uniqueSlug;
        }

        // 可选字段更新
        if (summary !== undefined) updateData.summary = summary;
        if (validCategoryId !== undefined) updateData.categoryId = validCategoryId;
        if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
        if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
        if (keywords !== undefined) {
            // 处理keywords字段：如果是数组，转换为逗号分隔的字符串
            if (Array.isArray(keywords)) {
                updateData.keywords = keywords.join(', ');
            } else if (typeof keywords === 'string') {
                updateData.keywords = keywords;
            } else {
                updateData.keywords = null;
            }
        }
        if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
        if (scheduledAt !== undefined) updateData.publishedAt = new Date(scheduledAt);

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

        // 更新标签关联
        if (validTagIds.length > 0) {
            await prisma.article.update({
                where: { id: id },
                data: {
                    tags: {
                        set: validTagIds.map(tagId => ({ id: tagId }))
                    }
                }
            });
        }

        return new Response(JSON.stringify({
            message: 'Draft updated successfully',
            draft: updatedArticle
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Update draft error:', error);

        let errorMessage = 'Failed to update draft';
        if (error instanceof Error) {
            console.error('Error details:', error.message);
            if (error.message.includes('Unique constraint')) {
                errorMessage = 'Draft title already exists';
            } else if (error.message.includes('Foreign key constraint')) {
                errorMessage = 'Invalid category or tag reference';
            }
        }

        return new Response(JSON.stringify({
            error: errorMessage,
            details: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

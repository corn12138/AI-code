'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getComments(postId: string) {
    try {
        const comments = await db.comments.findMany({
            where: { postId },
            orderBy: { createdAt: 'desc' }
        });

        return comments;
    } catch (error) {
        console.error('获取评论失败', error);
        return [];
    }
}

export async function submitComment(formData: FormData, postId: string) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const content = formData.get('content') as string;

    if (!name || !email || !content) {
        throw new Error('所有字段都是必填的');
    }

    try {
        const comment = await db.comments.create({
            data: {
                name,
                email,
                content,
                postId
            }
        });

        // 重新验证文章页面以显示新评论
        revalidatePath(`/posts/${postId}`);
        return comment;
    } catch (error) {
        console.error('提交评论失败', error);
        throw new Error('提交评论失败');
    }
}

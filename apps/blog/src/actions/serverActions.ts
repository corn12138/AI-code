'use server';

import { revalidatePath } from 'next/cache';

export async function updateData(formData: FormData) {
    // 服务器端操作，例如数据库更新
    const title = formData.get('title') as string;

    // 假设这里有数据库操作
    // await db.update({ title });

    // 重新验证路径，使更改反映在页面上
    revalidatePath('/');

    return { success: true };
}

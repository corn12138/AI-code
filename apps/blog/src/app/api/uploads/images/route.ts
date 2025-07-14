import {
    createApiResponse,
    handleApiError,
    requireAuth,
    validateMethod
} from '@/lib/api-auth';
import { writeFile } from 'fs/promises';
import { NextRequest } from 'next/server';
import { join } from 'path';

// 允许的图片类型
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// 最大文件大小 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 生成随机文件名
function generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop()?.toLowerCase();
    return `${timestamp}_${randomString}.${extension}`;
}

// 验证文件类型
function validateFileType(file: File): boolean {
    return ALLOWED_TYPES.includes(file.type);
}

// 验证文件大小
function validateFileSize(file: File): boolean {
    return file.size <= MAX_FILE_SIZE;
}

// 上传图片
export async function POST(request: NextRequest) {
    try {
        validateMethod(request, ['POST']);

        // 需要认证
        const user = await requireAuth(request);

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return createApiResponse({ error: 'No file uploaded' }, 400);
        }

        // 验证文件类型
        if (!validateFileType(file)) {
            return createApiResponse({
                error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'
            }, 400);
        }

        // 验证文件大小
        if (!validateFileSize(file)) {
            return createApiResponse({
                error: 'File too large. Maximum size is 10MB.'
            }, 400);
        }

        // 生成文件名
        const fileName = generateFileName(file.name);

        // 创建上传目录路径
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'images');
        const filePath = join(uploadDir, fileName);

        try {
            // 确保目录存在
            const { mkdirSync } = require('fs');
            mkdirSync(uploadDir, { recursive: true });

            // 将文件保存到磁盘
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            await writeFile(filePath, buffer);

            // 返回文件信息
            const fileUrl = `/uploads/images/${fileName}`;

            return createApiResponse({
                message: 'File uploaded successfully',
                file: {
                    originalName: file.name,
                    fileName: fileName,
                    url: fileUrl,
                    size: file.size,
                    type: file.type,
                    uploadedBy: user.id,
                    uploadedAt: new Date().toISOString()
                }
            }, 201);

        } catch (error) {
            console.error('File upload error:', error);
            return createApiResponse({
                error: 'Failed to save file'
            }, 500);
        }

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
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
} 
import { createApiResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // 测试数据库连接
        await prisma.$queryRaw`SELECT 1`;

        return createApiResponse({
            status: 'healthy',
            message: 'API is running',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    } catch (error) {
        return createApiResponse({
            status: 'unhealthy',
            message: 'Database connection failed',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
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
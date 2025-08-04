import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

interface UserStatisticsQuery {
    period?: 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
}

export async function GET(request: NextRequest) {
    try {
        // 验证用户认证
        const user = await requireAuth(request);

        // 解析查询参数
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') as 'week' | 'month' | 'year' || 'week';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // 计算时间范围
        const { start, end } = calculateDateRange(period, startDate, endDate);

        // 查询用户统计数据
        const userStats = await prisma.userStatistics.findMany({
            where: {
                userId: user.id,
                date: {
                    gte: start,
                    lte: end
                }
            },
            orderBy: {
                date: 'asc'
            }
        });

        // 计算汇总数据
        const summary = calculateSummary(userStats);

        // 获取模型使用排行
        const modelRanking = calculateModelRanking(userStats);

        // 查询最近的对话
        const recentConversations = await prisma.conversation.findMany({
            where: {
                userId: user.id,
                createdAt: {
                    gte: start,
                    lte: end
                }
            },
            orderBy: {
                updatedAt: 'desc'
            },
            take: 10,
            select: {
                id: true,
                title: true,
                model: true,
                messageCount: true,
                totalTokens: true,
                createdAt: true,
                status: true
            }
        });

        return new Response(JSON.stringify({
            period,
            dateRange: { start, end },
            summary,
            dailyStats: userStats,
            modelRanking,
            recentConversations
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('User statistics API error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to fetch user statistics',
            message: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function calculateDateRange(period: string, startDate?: string | null, endDate?: string | null) {
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    let start: Date;

    if (startDate) {
        start = new Date(startDate);
    } else {
        start = new Date();
        switch (period) {
            case 'week':
                start.setDate(start.getDate() - 7);
                break;
            case 'month':
                start.setMonth(start.getMonth() - 1);
                break;
            case 'year':
                start.setFullYear(start.getFullYear() - 1);
                break;
        }
    }

    start.setHours(0, 0, 0, 0);

    return { start, end };
}

function calculateSummary(stats: any[]) {
    return {
        totalConversations: stats.reduce((sum, stat) => sum + stat.conversationCount, 0),
        totalMessages: stats.reduce((sum, stat) => sum + stat.messageCount, 0),
        totalTokens: stats.reduce((sum, stat) => sum + stat.totalTokens, 0),
        totalCost: stats.reduce((sum, stat) => sum + Number(stat.totalCost), 0),
        totalDuration: stats.reduce((sum, stat) => sum + stat.totalDuration, 0),
        averageRating: stats.length > 0
            ? stats.filter(s => s.avgRating).reduce((sum, stat) => sum + stat.avgRating, 0) / stats.filter(s => s.avgRating).length
            : null,
        activeDays: stats.filter(stat => stat.messageCount > 0).length
    };
}

function calculateModelRanking(stats: any[]) {
    const modelUsage: { [key: string]: number } = {};

    stats.forEach(stat => {
        const usage = stat.modelUsage as { [key: string]: number };
        Object.entries(usage).forEach(([model, count]) => {
            modelUsage[model] = (modelUsage[model] || 0) + count;
        });
    });

    return Object.entries(modelUsage)
        .map(([model, count]) => ({ model, count }))
        .sort((a, b) => b.count - a.count);
} 
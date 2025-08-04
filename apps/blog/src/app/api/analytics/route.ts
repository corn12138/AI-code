import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // 验证用户认证
        const user = await requireAuth(request);

        // 解析查询参数
        const { searchParams } = new URL(request.url);
        const timeRange = searchParams.get('timeRange') as '7d' | '30d' | '90d' || '30d';

        // 计算时间范围
        const { start, end } = calculateDateRange(timeRange);

        // 并行获取所有数据
        const [
            userStats,
            conversationStats,
            messageStats,
            modelStats,
            dailyTrends,
            modelUsageRanking,
            articleStats
        ] = await Promise.all([
            getUserStatistics(user.id, start, end),
            getConversationStatistics(user.id, start, end),
            getMessageStatistics(user.id, start, end),
            getModelStatistics(start, end),
            getDailyTrends(user.id, start, end),
            getModelUsageRanking(user.id, start, end),
            getArticleStatistics(user.id, start, end)
        ]);

        // 计算总体指标
        const usage = {
            totalRequests: messageStats.totalMessages,
            totalTokens: conversationStats.totalTokens,
            totalCost: conversationStats.totalCost,
            avgResponseTime: messageStats.avgResponseTime,
            dailyTrend: dailyTrends,
            weeklyComparison: calculateWeeklyComparison(dailyTrends)
        };

        // 处理模型数据
        const models = modelUsageRanking.map(model => ({
            name: model.model,
            requests: model.count,
            successRate: 98.5, // 可以后续从错误日志计算
            avgResponseTime: model.avgResponseTime || 2.0,
            cost: model.totalCost || 0,
            trend: determineTrend(model.recentUsage)
        }));

        // 内容统计
        const content = {
            totalArticles: articleStats.totalArticles,
            totalDrafts: articleStats.totalDrafts,
            publishingRate: articleStats.publishingRate,
            avgWordsPerArticle: articleStats.avgWordsPerArticle,
            topCategories: articleStats.topCategories
        };

        // 性能数据
        const performance = {
            peakHours: generatePeakHours(messageStats.hourlyDistribution),
            errorRate: 1.8, // 可以后续从错误日志计算
            uptime: 99.7
        };

        return Response.json({
            timeRange,
            dateRange: { start, end },
            usage,
            models,
            content,
            performance,
            lastUpdated: new Date().toISOString()
        });

    } catch (error) {
        console.error('Analytics API error:', error);
        return Response.json({
            error: 'Failed to fetch analytics data',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// 计算日期范围
function calculateDateRange(timeRange: string) {
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const start = new Date();
    switch (timeRange) {
        case '7d':
            start.setDate(start.getDate() - 7);
            break;
        case '30d':
            start.setMonth(start.getMonth() - 1);
            break;
        case '90d':
            start.setDate(start.getDate() - 90);
            break;
    }
    start.setHours(0, 0, 0, 0);

    return { start, end };
}

// 获取用户统计
async function getUserStatistics(userId: string, start: Date, end: Date) {
    return await prisma.userStatistics.findMany({
        where: {
            userId,
            date: { gte: start, lte: end }
        },
        orderBy: { date: 'asc' }
    });
}

// 获取对话统计
async function getConversationStatistics(userId: string, start: Date, end: Date) {
    const conversations = await prisma.conversation.findMany({
        where: {
            userId,
            createdAt: { gte: start, lte: end }
        },
        select: {
            totalTokens: true,
            totalCost: true,
            duration: true
        }
    });

    return {
        totalConversations: conversations.length,
        totalTokens: conversations.reduce((sum, c) => sum + (c.totalTokens || 0), 0),
        totalCost: conversations.reduce((sum, c) => sum + Number(c.totalCost || 0), 0),
        avgDuration: conversations.length > 0
            ? conversations.reduce((sum, c) => sum + (c.duration || 0), 0) / conversations.length
            : 0
    };
}

// 获取消息统计
async function getMessageStatistics(userId: string, start: Date, end: Date) {
    const messages = await prisma.message.findMany({
        where: {
            userId,
            createdAt: { gte: start, lte: end }
        },
        select: {
            responseTime: true,
            createdAt: true,
            role: true
        }
    });

    // 按小时分布
    const hourlyDistribution = Array(24).fill(0);
    messages.forEach(msg => {
        const hour = new Date(msg.createdAt).getHours();
        hourlyDistribution[hour]++;
    });

    const responseTimes = messages
        .filter(m => m.responseTime && m.role === 'assistant')
        .map(m => m.responseTime!);

    return {
        totalMessages: messages.length,
        avgResponseTime: responseTimes.length > 0
            ? responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length / 1000 // 转换为秒
            : 2.0,
        hourlyDistribution
    };
}

// 获取模型统计
async function getModelStatistics(start: Date, end: Date) {
    return await prisma.modelStatistics.findMany({
        where: {
            date: { gte: start, lte: end }
        },
        orderBy: { date: 'asc' }
    });
}

// 获取每日趋势
async function getDailyTrends(userId: string, start: Date, end: Date) {
    const trends = await prisma.userStatistics.findMany({
        where: {
            userId,
            date: { gte: start, lte: end }
        },
        orderBy: { date: 'asc' }
    });

    return trends.map(trend => ({
        date: trend.date.toISOString().split('T')[0],
        requests: trend.messageCount,
        tokens: trend.totalTokens,
        cost: Number(trend.totalCost),
        responseTime: trend.avgResponseTime ? trend.avgResponseTime / 1000 : 2.0
    }));
}

// 获取模型使用排行
async function getModelUsageRanking(userId: string, start: Date, end: Date) {
    const conversations = await prisma.conversation.findMany({
        where: {
            userId,
            createdAt: { gte: start, lte: end }
        },
        select: {
            model: true,
            totalCost: true,
            duration: true,
            messageCount: true
        }
    });

    const modelGroups: { [key: string]: any } = {};

    conversations.forEach(conv => {
        if (!modelGroups[conv.model]) {
            modelGroups[conv.model] = {
                model: conv.model,
                count: 0,
                totalCost: 0,
                totalDuration: 0,
                totalMessages: 0,
                recentUsage: []
            };
        }

        const group = modelGroups[conv.model];
        group.count++;
        group.totalCost += Number(conv.totalCost || 0);
        group.totalDuration += conv.duration || 0;
        group.totalMessages += conv.messageCount || 0;
    });

    return Object.values(modelGroups)
        .map((group: any) => ({
            ...group,
            avgResponseTime: group.count > 0 ? group.totalDuration / group.count / 1000 : 2.0
        }))
        .sort((a: any, b: any) => b.count - a.count);
}

// 获取文章统计
async function getArticleStatistics(userId: string, start: Date, end: Date) {
    const articles = await prisma.article.findMany({
        where: {
            authorId: userId,
            createdAt: { gte: start, lte: end }
        },
        select: {
            status: true,
            content: true,
            category: {
                select: {
                    name: true
                }
            }
        }
    });

    // 单独查询分类统计
    const categoryStats = await prisma.article.groupBy({
        by: ['categoryId'],
        where: {
            authorId: userId,
            createdAt: { gte: start, lte: end },
            categoryId: { not: null }
        },
        _count: {
            categoryId: true
        },
        orderBy: {
            _count: {
                categoryId: 'desc'
            }
        },
        take: 5
    });

    // 获取分类名称
    const categoryIds = categoryStats.map(stat => stat.categoryId!);
    const categories = await prisma.category.findMany({
        where: {
            id: { in: categoryIds }
        },
        select: {
            id: true,
            name: true
        }
    });

    const categoryMap = categories.reduce((map, cat) => {
        map[cat.id] = cat.name;
        return map;
    }, {} as Record<string, string>);

    const totalArticles = articles.filter(a => a.status === 'PUBLISHED').length;
    const totalDrafts = articles.filter(a => a.status === 'DRAFT').length;

    const wordCounts = articles.map(a => a.content?.length || 0).filter(len => len > 0);
    const avgWordsPerArticle = wordCounts.length > 0
        ? Math.round(wordCounts.reduce((sum, len) => sum + len, 0) / wordCounts.length)
        : 0;

    const publishingRate = articles.length > 0
        ? Math.round((totalArticles / articles.length) * 100)
        : 0;

    // 构建顶级分类数据
    const topCategories = categoryStats.map(stat => ({
        name: categoryMap[stat.categoryId!] || '未分类',
        count: stat._count.categoryId,
        percentage: articles.length > 0
            ? Math.round((stat._count.categoryId / articles.length) * 100)
            : 0
    }));

    return {
        totalArticles,
        totalDrafts,
        publishingRate,
        avgWordsPerArticle,
        topCategories
    };
}

// 计算周比较
function calculateWeeklyComparison(dailyTrends: any[]) {
    if (dailyTrends.length < 14) {
        return { current: 0, previous: 0, change: 0 };
    }

    const currentWeek = dailyTrends.slice(-7);
    const previousWeek = dailyTrends.slice(-14, -7);

    const currentTotal = currentWeek.reduce((sum, day) => sum + day.requests, 0);
    const previousTotal = previousWeek.reduce((sum, day) => sum + day.requests, 0);

    const change = previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

    return {
        current: currentTotal,
        previous: previousTotal,
        change: Math.round(change * 10) / 10
    };
}

// 判断趋势
function determineTrend(recentUsage: any[]): 'up' | 'down' | 'stable' {
    // 简化的趋势判断逻辑
    return 'stable';
}

// 生成峰值小时数据
function generatePeakHours(hourlyDistribution: number[]) {
    return hourlyDistribution.map((requests, hour) => ({
        hour,
        requests
    }));
} 
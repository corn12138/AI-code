import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // 验证用户认证
        const user = await requireAuth(request);
        
        // 解析查询参数
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') as 'week' | 'month' | 'year' || 'week';
        
        // 计算时间范围
        const { start, end } = calculateDateRange(period);
        
        // 查询模型统计数据
        const modelStats = await prisma.modelStatistics.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end
                }
            },
            orderBy: [
                { date: 'asc' },
                { model: 'asc' }
            ]
        });
        
        // 计算模型排行
        const modelRanking = calculateModelRanking(modelStats);
        
        // 计算整体统计
        const overallStats = calculateOverallStats(modelStats);
        
        return new Response(JSON.stringify({
            period,
            dateRange: { start, end },
            overallStats,
            modelRanking,
            rawData: modelStats
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Model statistics API error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to fetch model statistics'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function calculateDateRange(period: string) {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    const start = new Date();
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
    start.setHours(0, 0, 0, 0);
    
    return { start, end };
}

function calculateModelRanking(stats: any[]) {
    const modelGroups: { [key: string]: any } = {};
    
    stats.forEach(stat => {
        const key = `${stat.model}-${stat.modelProvider}`;
        if (!modelGroups[key]) {
            modelGroups[key] = {
                model: stat.model,
                provider: stat.modelProvider,
                totalRequests: 0,
                totalTokens: 0,
                totalCost: 0
            };
        }
        
        const group = modelGroups[key];
        group.totalRequests += stat.requestCount;
        group.totalTokens += stat.totalTokens;
        group.totalCost += Number(stat.totalCost);
    });
    
    return Object.values(modelGroups)
        .sort((a: any, b: any) => b.totalRequests - a.totalRequests);
}

function calculateOverallStats(stats: any[]) {
    return {
        totalRequests: stats.reduce((sum, stat) => sum + stat.requestCount, 0),
        totalTokens: stats.reduce((sum, stat) => sum + stat.totalTokens, 0),
        totalCost: stats.reduce((sum, stat) => sum + Number(stat.totalCost), 0),
        activeModels: new Set(stats.map(s => s.model)).size
    };
}

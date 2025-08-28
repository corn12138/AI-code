// AI统计数据查询API

import { aiAnalytics } from '@/lib/ai-analytics';
import { requireAuth } from '@/lib/api-auth';
import { AIFeatureType, AIUsageScenario, StatisticsQuery, TimeRange } from '@/types/ai-analytics';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // 验证用户认证
        const user = await requireAuth(request);

        const { searchParams } = new URL(request.url);

        // 解析查询参数
        const query: StatisticsQuery = {
            timeRange: (searchParams.get('timeRange') as TimeRange) || TimeRange.DAY,
            startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : new Date(Date.now() - 24 * 60 * 60 * 1000),
            endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : new Date(),

            filters: {
                userIds: searchParams.get('userIds')?.split(',').filter(Boolean),
                models: searchParams.get('models')?.split(',').filter(Boolean),
                features: searchParams.get('features')?.split(',').filter(Boolean).map(f => f as AIFeatureType),
                scenarios: searchParams.get('scenarios')?.split(',').filter(Boolean).map(s => s as AIUsageScenario),
                userSegments: searchParams.get('userSegments')?.split(',').filter(Boolean)
            },

            aggregation: {
                groupBy: (searchParams.get('groupBy') as any) || 'time',
                timeGranularity: (searchParams.get('timeGranularity') as any) || 'hour',
                includeComparisons: searchParams.get('includeComparisons') === 'true',
                includeTrends: searchParams.get('includeTrends') === 'true',
                includeForecasts: searchParams.get('includeForecasts') === 'true'
            },

            output: {
                format: (searchParams.get('format') as any) || 'json',
                includeCharts: searchParams.get('includeCharts') === 'true',
                includeInsights: searchParams.get('includeInsights') === 'true',
                includeRecommendations: searchParams.get('includeRecommendations') === 'true'
            }
        };

        // 权限检查 - 只有管理员或用户本人可以查看详细数据
        if (query.filters?.userIds && !isAdmin(user) && !query.filters.userIds.includes(user.id)) {
            return NextResponse.json({
                success: false,
                error: 'Insufficient permissions',
                message: 'You can only view your own statistics'
            }, { status: 403 });
        }

        // 如果是普通用户，只返回自己的数据
        if (!isAdmin(user)) {
            query.filters = {
                ...query.filters,
                userIds: [user.id]
            };
        }

        // 执行统计查询
        const result = await aiAnalytics.executeQuery(query);

        return NextResponse.json(result);

    } catch (error) {
        console.error('Failed to get AI statistics:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to retrieve statistics',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // 验证用户认证
        const user = await requireAuth(request);

        // 只有管理员可以执行复杂查询
        if (!isAdmin(user)) {
            return NextResponse.json({
                success: false,
                error: 'Insufficient permissions',
                message: 'Admin access required for custom queries'
            }, { status: 403 });
        }

        const query: StatisticsQuery = await request.json();

        // 执行统计查询
        const result = await aiAnalytics.executeQuery(query);

        return NextResponse.json(result);

    } catch (error) {
        console.error('Failed to execute custom query:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to execute query',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// 获取用户个人统计
export async function getUserStats(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        const { searchParams } = new URL(request.url);

        const timeRange = (searchParams.get('timeRange') as TimeRange) || TimeRange.WEEK;
        const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
        const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

        const userStats = await aiAnalytics.getUserStatistics(user.id, timeRange, startDate, endDate);

        return NextResponse.json({
            success: true,
            data: userStats
        });

    } catch (error) {
        console.error('Failed to get user statistics:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to retrieve user statistics',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// 获取模型统计
export async function getModelStats(request: NextRequest) {
    try {
        await requireAuth(request);
        const { searchParams } = new URL(request.url);

        const model = searchParams.get('model');
        if (!model) {
            return NextResponse.json({
                success: false,
                error: 'Model parameter is required'
            }, { status: 400 });
        }

        const timeRange = (searchParams.get('timeRange') as TimeRange) || TimeRange.WEEK;
        const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
        const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

        const modelStats = await aiAnalytics.getModelStatistics(model, timeRange, startDate, endDate);

        return NextResponse.json({
            success: true,
            data: modelStats
        });

    } catch (error) {
        console.error('Failed to get model statistics:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to retrieve model statistics',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// 获取实时统计
export async function getRealTimeStats(request: NextRequest) {
    try {
        const user = await requireAuth(request);

        // 只有管理员可以查看实时统计
        if (!isAdmin(user)) {
            return NextResponse.json({
                success: false,
                error: 'Insufficient permissions',
                message: 'Admin access required for real-time statistics'
            }, { status: 403 });
        }

        const realTimeStats = await aiAnalytics.getRealTimeStats();

        return NextResponse.json({
            success: true,
            data: realTimeStats
        });

    } catch (error) {
        console.error('Failed to get real-time statistics:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to retrieve real-time statistics',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// 辅助函数
function isAdmin(user: any): boolean {
    return user.roles && (user.roles.includes('admin') || user.roles.includes('super_admin'));
}
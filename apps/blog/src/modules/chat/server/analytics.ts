import { prisma } from '@/lib/prisma';
import { getModelProvider } from './metrics';

interface AnalyticsPayload {
    model: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
    responseTime: number;
}

export async function collectAnalyticsData(userId: string, conversationId: string, data: AnalyticsPayload) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.userStatistics.upsert({
        where: {
            userId_date: {
                userId,
                date: today,
            },
        },
        update: {
            messageCount: { increment: 2 },
            totalTokens: { increment: data.totalTokens },
            totalCost: { increment: data.cost },
            totalDuration: { increment: Math.round(data.responseTime / 1000) },
        },
        create: {
            userId,
            date: today,
            conversationCount: 1,
            messageCount: 2,
            totalTokens: data.totalTokens,
            totalCost: data.cost,
            totalDuration: Math.round(data.responseTime / 1000),
            modelUsage: {
                [data.model]: 1,
            },
        },
    });

    const modelProvider = getModelProvider(data.model);

    await prisma.modelStatistics.upsert({
        where: {
            model_modelProvider_date: {
                model: data.model,
                modelProvider,
                date: today,
            },
        },
        update: {
            requestCount: { increment: 1 },
            totalTokens: { increment: data.totalTokens },
            totalCost: { increment: data.cost },
            avgResponseTime: data.responseTime,
        },
        create: {
            model: data.model,
            modelProvider,
            date: today,
            requestCount: 1,
            userCount: 1,
            totalTokens: data.totalTokens,
            totalCost: data.cost,
            avgResponseTime: data.responseTime,
            maxResponseTime: data.responseTime,
            minResponseTime: data.responseTime,
            avgRating: null,
            errorRate: 0,
        },
    });
}

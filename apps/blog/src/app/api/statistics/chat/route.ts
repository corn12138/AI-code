import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// 获取聊天统计数据
export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request);

        // 获取总对话数
        const totalConversations = await prisma.conversation.count({
            where: { userId: user.id }
        });

        // 获取总消息数
        const totalMessages = await prisma.message.count({
            where: { userId: user.id }
        });

        // 获取今日对话数
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayConversations = await prisma.conversation.count({
            where: {
                userId: user.id,
                createdAt: {
                    gte: today
                }
            }
        });

        // 获取今日消息数
        const todayMessages = await prisma.message.count({
            where: {
                userId: user.id,
                createdAt: {
                    gte: today
                }
            }
        });

        // 获取最近7天的对话趋势
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const conversationTrend = await prisma.conversation.groupBy({
            by: ['createdAt'],
            where: {
                userId: user.id,
                createdAt: {
                    gte: sevenDaysAgo
                }
            },
            _count: {
                id: true
            }
        });

        // 获取最热门的模型使用情况
        const modelUsage = await prisma.conversation.groupBy({
            by: ['model'],
            where: { userId: user.id },
            _count: {
                model: true
            },
            orderBy: {
                _count: {
                    model: 'desc'
                }
            },
            take: 5
        });

        // 获取最近的对话
        const recentConversations = await prisma.conversation.findMany({
            where: { userId: user.id },
            include: {
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: { messages: true }
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: 5
        });

        // 格式化最近对话数据
        const formattedRecentConversations = recentConversations.map(conv => ({
            id: conv.id,
            title: conv.title,
            messageCount: conv._count.messages,
            lastMessage: conv.messages[0]?.content.substring(0, 100) || null,
            model: conv.model,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt
        }));

        // 按日期格式化趋势数据
        const trendData = conversationTrend.reduce((acc, item) => {
            const date = item.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + item._count.id;
            return acc;
        }, {} as Record<string, number>);

        // 生成完整的7天数据（包括没有对话的日期）
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last7Days.push({
                date: dateStr,
                count: trendData[dateStr] || 0
            });
        }

        return Response.json({
            statistics: {
                totalConversations,
                totalMessages,
                todayConversations,
                todayMessages,
                conversationTrend: last7Days,
                modelUsage: modelUsage.map(item => ({
                    model: item.model,
                    count: item._count.model
                })),
                recentConversations: formattedRecentConversations
            }
        });

    } catch (error) {
        console.error('Get chat statistics error:', error);
        return new Response('Unauthorized', { status: 401 });
    }
} 
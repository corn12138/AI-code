// AI交互数据收集API

import { aiAnalytics } from '@/lib/ai-analytics';
import { requireAuth } from '@/lib/api-auth';
import { AIFeatureType, AIInteractionEvent, AIUsageScenario } from '@/types/ai-analytics';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // 验证用户认证
        const user = await requireAuth(request);

        const eventData = await request.json();

        // 构建AI交互事件
        const event: AIInteractionEvent = {
            id: generateEventId(),
            userId: user.id,
            sessionId: eventData.sessionId || generateSessionId(),
            conversationId: eventData.conversationId,
            featureType: eventData.featureType || AIFeatureType.CHAT,
            scenario: eventData.scenario || AIUsageScenario.TECHNICAL_QA,
            model: eventData.model,
            timestamp: new Date(),

            requestData: {
                inputLength: eventData.inputText?.length || 0,
                inputTokens: eventData.inputTokens || 0,
                temperature: eventData.temperature || 0.7,
                maxTokens: eventData.maxTokens || 1000,
                promptCategory: categorizePrompt(eventData.inputText),
                isFirstMessage: eventData.isFirstMessage || false
            },

            responseData: {
                outputLength: eventData.outputText?.length || 0,
                outputTokens: eventData.outputTokens || 0,
                responseTime: eventData.responseTime || 0,
                finishReason: eventData.finishReason || 'stop',
                streamingTime: eventData.streamingTime
            },

            qualityData: {
                userRating: eventData.userRating,
                feedback: eventData.feedback,
                isSuccessful: eventData.isSuccessful !== false,
                errorCode: eventData.errorCode,
                confidence: eventData.confidence,
                relevanceScore: calculateRelevanceScore(eventData.inputText, eventData.outputText)
            },

            contextData: {
                conversationLength: eventData.conversationLength || 1,
                deviceType: getDeviceType(request.headers.get('user-agent')),
                userAgent: request.headers.get('user-agent') || '',
                referrer: request.headers.get('referer') || undefined,
                timezone: eventData.timezone || 'UTC'
            },

            costData: {
                inputCost: calculateInputCost(eventData.model, eventData.inputTokens),
                outputCost: calculateOutputCost(eventData.model, eventData.outputTokens),
                totalCost: calculateTotalCost(eventData.model, eventData.inputTokens, eventData.outputTokens),
                provider: getModelProvider(eventData.model)
            }
        };

        // 记录事件
        await aiAnalytics.recordInteraction(event);

        return NextResponse.json({
            success: true,
            eventId: event.id,
            message: 'AI interaction recorded successfully'
        });

    } catch (error) {
        console.error('Failed to collect AI analytics:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to record interaction',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// 辅助函数

function generateEventId(): string {
    return `ai_event_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

function categorizePrompt(inputText: string): string {
    if (!inputText) return 'unknown';

    const text = inputText.toLowerCase();

    if (text.includes('代码') || text.includes('code') || text.includes('编程') || text.includes('bug')) {
        return 'programming';
    }
    if (text.includes('写') || text.includes('创作') || text.includes('文章') || text.includes('博客')) {
        return 'writing';
    }
    if (text.includes('解释') || text.includes('什么是') || text.includes('如何') || text.includes('为什么')) {
        return 'explanation';
    }
    if (text.includes('分析') || text.includes('比较') || text.includes('评估')) {
        return 'analysis';
    }
    if (text.includes('翻译') || text.includes('translate')) {
        return 'translation';
    }
    if (text.includes('总结') || text.includes('归纳') || text.includes('摘要')) {
        return 'summarization';
    }

    return 'general';
}

function calculateRelevanceScore(inputText: string, outputText: string): number {
    if (!inputText || !outputText) return 0;

    // 简化的相关性计算 - 基于关键词匹配
    const inputWords = inputText.toLowerCase().split(/\s+/);
    const outputWords = outputText.toLowerCase().split(/\s+/);

    const matchingWords = inputWords.filter(word =>
        word.length > 2 && outputWords.includes(word)
    );

    return Math.min(matchingWords.length / Math.max(inputWords.length * 0.3, 1), 1);
}

function getDeviceType(userAgent: string | null): string {
    if (!userAgent) return 'unknown';

    const ua = userAgent.toLowerCase();

    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        return 'mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
        return 'tablet';
    }

    return 'desktop';
}

function calculateInputCost(model: string, tokens: number): number {
    const pricing: Record<string, number> = {
        'qwen/qwen2.5-7b-instruct/bf-16': 0.0001,
        'google/gemma-3-27b-instruct/bf-16': 0.0002,
        'gpt-3.5-turbo': 0.0015,
        'gpt-4': 0.03
    };

    const rate = pricing[model] || pricing['qwen/qwen2.5-7b-instruct/bf-16'];
    return (tokens * rate) / 1000;
}

function calculateOutputCost(model: string, tokens: number): number {
    const pricing: Record<string, number> = {
        'qwen/qwen2.5-7b-instruct/bf-16': 0.0001,
        'google/gemma-3-27b-instruct/bf-16': 0.0002,
        'gpt-3.5-turbo': 0.002,
        'gpt-4': 0.06
    };

    const rate = pricing[model] || pricing['qwen/qwen2.5-7b-instruct/bf-16'];
    return (tokens * rate) / 1000;
}

function calculateTotalCost(model: string, inputTokens: number, outputTokens: number): number {
    return calculateInputCost(model, inputTokens) + calculateOutputCost(model, outputTokens);
}

function getModelProvider(model: string): string {
    if (model.includes('qwen')) return 'alibaba';
    if (model.includes('gemma') || model.includes('google')) return 'google';
    if (model.includes('gpt')) return 'openai';
    if (model.includes('claude')) return 'anthropic';
    return 'unknown';
}
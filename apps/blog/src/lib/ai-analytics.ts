// AI统计分析核心逻辑

import { prisma } from '@/lib/prisma';
import {
    AIFeatureType,
    AIInteractionEvent,
    AnomalyDetection,
    BasicUsageMetrics,
    BusinessMetrics,
    InsightReport,
    ModelStatisticsDetail,
    PerformanceMetrics,
    RealTimeStats,
    StatisticsQuery,
    StatisticsResponse,
    TimeRange,
    TrendAnalysis,
    UserActivityLevel,
    UserStatisticsDetail
} from '@/types/ai-analytics';

export class AIAnalyticsEngine {

    /**
     * 记录AI交互事件
     */
    async recordInteraction(event: AIInteractionEvent): Promise<void> {
        try {
            // 1. 保存原始事件数据
            await this.saveInteractionEvent(event);

            // 2. 更新实时统计
            await this.updateRealTimeStats(event);

            // 3. 异步处理统计聚合
            this.processStatisticsAsync(event);

        } catch (error) {
            console.error('Failed to record AI interaction:', error);
            throw error;
        }
    }

    /**
     * 获取用户统计数据
     */
    async getUserStatistics(
        userId: string,
        timeRange: TimeRange,
        startDate?: Date,
        endDate?: Date
    ): Promise<UserStatisticsDetail> {

        const { start, end } = this.getTimeRange(timeRange, startDate, endDate);

        // 1. 获取基础使用指标
        const basicMetrics = await this.calculateBasicUserMetrics(userId, start, end);

        // 2. 获取性能指标
        const performanceMetrics = await this.calculateUserPerformanceMetrics(userId, start, end);

        // 3. 获取业务指标
        const businessMetrics = await this.calculateUserBusinessMetrics(userId, start, end);

        // 4. 获取用户画像
        const userProfile = await this.getUserProfile(userId);

        // 5. 分析使用模式
        const usagePatterns = await this.analyzeUserUsagePatterns(userId, start, end);

        // 6. 计算成长指标
        const growthMetrics = await this.calculateUserGrowthMetrics(userId, start, end);

        return {
            userId,
            date: new Date(),
            timeRange,
            ...basicMetrics,
            ...performanceMetrics,
            ...businessMetrics,
            userProfile,
            usagePatterns,
            growthMetrics
        };
    }

    /**
     * 获取模型统计数据
     */
    async getModelStatistics(
        model: string,
        timeRange: TimeRange,
        startDate?: Date,
        endDate?: Date
    ): Promise<ModelStatisticsDetail> {

        const { start, end } = this.getTimeRange(timeRange, startDate, endDate);

        // 1. 基础指标
        const usage = await this.calculateModelUsageMetrics(model, start, end);
        const performance = await this.calculateModelPerformanceMetrics(model, start, end);
        const business = await this.calculateModelBusinessMetrics(model, start, end);

        // 2. 模型特定指标
        const modelMetrics = await this.calculateModelSpecificMetrics(model, start, end);

        // 3. 使用分布
        const usageDistribution = await this.calculateModelUsageDistribution(model, start, end);

        // 4. 基准对比
        const benchmarks = await this.getModelBenchmarks(model, start, end);

        return {
            model,
            provider: this.getModelProvider(model),
            date: new Date(),
            timeRange,
            usage,
            performance,
            business,
            modelMetrics,
            usageDistribution,
            benchmarks
        };
    }

    /**
     * 执行统计查询
     */
    async executeQuery(query: StatisticsQuery): Promise<StatisticsResponse> {
        const startTime = Date.now();

        try {
            // 1. 基础统计
            const basic = await this.calculateBasicMetrics(query);
            const performance = await this.calculatePerformanceMetrics(query);
            const business = await this.calculateBusinessMetrics(query);

            // 2. 可选的高级分析
            let trends: TrendAnalysis[] | undefined;
            let anomalies: AnomalyDetection[] | undefined;
            let insights: InsightReport[] | undefined;

            if (query.aggregation?.includeTrends) {
                trends = await this.calculateTrends(query);
            }

            if (query.aggregation?.includeComparisons) {
                anomalies = await this.detectAnomalies(query);
            }

            if (query.output?.includeInsights) {
                insights = await this.generateInsights(query, { basic, performance, business });
            }

            const queryTime = Date.now() - startTime;

            return {
                success: true,
                data: {
                    basic,
                    performance,
                    business,
                    trends,
                    anomalies,
                    insights
                },
                metadata: {
                    queryTime,
                    dataPoints: await this.countDataPoints(query),
                    lastUpdated: new Date(),
                    nextUpdate: this.getNextUpdateTime()
                }
            };

        } catch (error) {
            console.error('Failed to execute statistics query:', error);
            return {
                success: false,
                data: {
                    basic: this.getEmptyBasicMetrics(),
                    performance: this.getEmptyPerformanceMetrics(),
                    business: this.getEmptyBusinessMetrics()
                },
                metadata: {
                    queryTime: Date.now() - startTime,
                    dataPoints: 0,
                    lastUpdated: new Date()
                },
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }

    /**
     * 获取实时统计数据
     */
    async getRealTimeStats(): Promise<RealTimeStats> {
        const now = new Date();

        // 1. 实时指标
        const live = await this.getCurrentLiveStats();

        // 2. 近期趋势
        const recent = {
            last5Minutes: await this.getRecentStats(5),
            last15Minutes: await this.getRecentStats(15),
            lastHour: await this.getRecentStats(60)
        };

        // 3. 系统状态
        const system = await this.getSystemStatus();

        return {
            timestamp: now,
            live,
            recent,
            system
        };
    }

    /**
     * 用户活跃度计算
     */
    calculateUserActivityLevel(userStats: UserStatisticsDetail): UserActivityLevel {
        const weights = {
            sessionCount: 0.3,
            messageCount: 0.25,
            sessionDuration: 0.2,
            featureUsage: 0.15,
            userRating: 0.1
        };

        // 标准化分数
        const normalizedScores = {
            sessionCount: Math.min(userStats.totalSessions / 10, 1), // 10个会话为满分
            messageCount: Math.min(userStats.totalMessages / 50, 1), // 50个消息为满分
            sessionDuration: Math.min(userStats.avgSessionDuration / 1800, 1), // 30分钟为满分
            featureUsage: Math.min(Object.keys(userStats.featureAdoptionRate).length / 5, 1), // 5个功能为满分
            userRating: userStats.avgUserRating / 5 // 5分制
        };

        // 计算加权分数
        const activityScore = Object.entries(weights).reduce((total, [key, weight]) => {
            return total + (normalizedScores[key as keyof typeof normalizedScores] * weight);
        }, 0) * 100;

        // 分级
        if (activityScore >= 80) return UserActivityLevel.HIGH;
        if (activityScore >= 60) return UserActivityLevel.MEDIUM;
        if (activityScore >= 30) return UserActivityLevel.LOW;
        return UserActivityLevel.INACTIVE;
    }

    /**
     * 异常检测
     */
    async detectAnomalies(query: StatisticsQuery): Promise<AnomalyDetection[]> {
        const anomalies: AnomalyDetection[] = [];

        // 1. 性能异常检测
        const performanceAnomalies = await this.detectPerformanceAnomalies(query);
        anomalies.push(...performanceAnomalies);

        // 2. 使用量异常检测
        const usageAnomalies = await this.detectUsageAnomalies(query);
        anomalies.push(...usageAnomalies);

        // 3. 成本异常检测
        const costAnomalies = await this.detectCostAnomalies(query);
        anomalies.push(...costAnomalies);

        // 4. 质量异常检测
        const qualityAnomalies = await this.detectQualityAnomalies(query);
        anomalies.push(...qualityAnomalies);

        return anomalies.sort((a, b) => {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        });
    }

    /**
     * 生成洞察报告
     */
    async generateInsights(
        query: StatisticsQuery,
        metrics: {
            basic: BasicUsageMetrics;
            performance: PerformanceMetrics;
            business: BusinessMetrics;
        }
    ): Promise<InsightReport[]> {
        const insights: InsightReport[] = [];

        // 1. 性能优化机会
        const performanceInsights = await this.generatePerformanceInsights(metrics);
        insights.push(...performanceInsights);

        // 2. 成本优化建议
        const costInsights = await this.generateCostInsights(metrics);
        insights.push(...costInsights);

        // 3. 用户体验改进
        const uxInsights = await this.generateUXInsights(metrics);
        insights.push(...uxInsights);

        // 4. 业务价值提升
        const businessInsights = await this.generateBusinessInsights(metrics);
        insights.push(...businessInsights);

        return insights.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    // ==================== 私有方法 ====================

    private async saveInteractionEvent(event: AIInteractionEvent): Promise<void> {
        // 实现事件数据保存逻辑
        await prisma.aIInteractionEvent.create({
            data: {
                ...event,
                requestData: event.requestData as any,
                responseData: event.responseData as any,
                qualityData: event.qualityData as any,
                contextData: event.contextData as any,
                costData: event.costData as any
            }
        });
    }

    private async updateRealTimeStats(event: AIInteractionEvent): Promise<void> {
        // 更新Redis中的实时统计数据
        // 实现Redis缓存更新逻辑
    }

    private processStatisticsAsync(event: AIInteractionEvent): void {
        // 异步处理统计聚合，不阻塞主流程
        setImmediate(async () => {
            try {
                await this.aggregateStatistics(event);
            } catch (error) {
                console.error('Failed to process statistics async:', error);
            }
        });
    }

    private async aggregateStatistics(event: AIInteractionEvent): Promise<void> {
        // 1. 更新用户统计
        await this.updateUserStatistics(event);

        // 2. 更新模型统计
        await this.updateModelStatistics(event);

        // 3. 更新全局统计
        await this.updateGlobalStatistics(event);
    }

    private getTimeRange(timeRange: TimeRange, startDate?: Date, endDate?: Date) {
        const now = new Date();
        let start: Date, end: Date = endDate || now;

        if (startDate) {
            start = startDate;
        } else {
            switch (timeRange) {
                case TimeRange.HOUR:
                    start = new Date(now.getTime() - 60 * 60 * 1000);
                    break;
                case TimeRange.DAY:
                    start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case TimeRange.WEEK:
                    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case TimeRange.MONTH:
                    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case TimeRange.QUARTER:
                    start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                case TimeRange.YEAR:
                    start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            }
        }

        return { start, end };
    }

    private getModelProvider(model: string): string {
        if (model.includes('qwen')) return 'alibaba';
        if (model.includes('gemma') || model.includes('google')) return 'google';
        if (model.includes('gpt')) return 'openai';
        if (model.includes('claude')) return 'anthropic';
        return 'unknown';
    }

    private getEmptyBasicMetrics(): BasicUsageMetrics {
        return {
            totalSessions: 0,
            totalMessages: 0,
            totalUsers: 0,
            activeUsers: 0,
            newUsers: 0,
            returningUsers: 0,
            totalTokens: 0,
            inputTokens: 0,
            outputTokens: 0,
            avgTokensPerMessage: 0,
            avgTokensPerSession: 0,
            totalCost: 0,
            avgCostPerMessage: 0,
            avgCostPerUser: 0,
            avgCostPerSession: 0,
            costByModel: {},
            totalDuration: 0,
            avgSessionDuration: 0,
            avgMessageInterval: 0
        };
    }

    private getEmptyPerformanceMetrics(): PerformanceMetrics {
        return {
            avgResponseTime: 0,
            medianResponseTime: 0,
            p95ResponseTime: 0,
            p99ResponseTime: 0,
            minResponseTime: 0,
            maxResponseTime: 0,
            successRate: 0,
            errorRate: 0,
            timeoutRate: 0,
            retryRate: 0,
            avgUserRating: 0,
            satisfactionRate: 0,
            npsScore: 0,
            feedbackCount: 0,
            modelAccuracy: 0,
            responseRelevance: 0,
            contextUnderstanding: 0,
            contentQuality: 0
        };
    }

    private getEmptyBusinessMetrics(): BusinessMetrics {
        return {
            userRetentionRate: {},
            sessionDuration: 0,
            messagesPerSession: 0,
            returningUserRate: 0,
            dailyActiveUsers: 0,
            weeklyActiveUsers: 0,
            monthlyActiveUsers: 0,
            featureAdoptionRate: {} as Record<AIFeatureType, number>,
            featureUsageFrequency: {} as Record<AIFeatureType, number>,
            crossFeatureUsage: 0,
            featureStickiness: {} as Record<AIFeatureType, number>,
            taskCompletionRate: 0,
            userProductivity: 0,
            contentGenerationRate: 0,
            problemSolvingRate: 0,
            costPerActiveUser: 0,
            revenuePerUser: 0,
            roi: 0,
            lifetimeValue: 0
        };
    }

    private getNextUpdateTime(): Date {
        const now = new Date();
        return new Date(now.getTime() + 5 * 60 * 1000); // 5分钟后更新
    }

    // 其他私有方法的占位符实现
    private async calculateBasicUserMetrics(userId: string, start: Date, end: Date): Promise<BasicUsageMetrics> {
        // TODO: 实现用户基础指标计算
        return this.getEmptyBasicMetrics();
    }

    private async calculateUserPerformanceMetrics(userId: string, start: Date, end: Date): Promise<PerformanceMetrics> {
        // TODO: 实现用户性能指标计算
        return this.getEmptyPerformanceMetrics();
    }

    private async calculateUserBusinessMetrics(userId: string, start: Date, end: Date): Promise<BusinessMetrics> {
        // TODO: 实现用户业务指标计算
        return this.getEmptyBusinessMetrics();
    }

    // 更多方法将在后续实现...
}

// 导出单例实例
export const aiAnalytics = new AIAnalyticsEngine();
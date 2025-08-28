// AI使用统计相关类型定义

export enum AIFeatureType {
    // 对话类功能
    CHAT = 'chat',
    WRITING_ASSISTANT = 'writing',

    // 编程类功能 (未来扩展)
    CODE_GENERATION = 'code_gen',
    CODE_REVIEW = 'code_review',
    CODE_COMPLETION = 'code_complete',

    // 内容类功能 (未来扩展)
    CONTENT_GENERATION = 'content_gen',
    CONTENT_OPTIMIZATION = 'content_opt',
    SEO_OPTIMIZATION = 'seo_opt',

    // 分析类功能 (未来扩展)
    PERFORMANCE_ANALYSIS = 'perf_analysis',
    DATA_ANALYSIS = 'data_analysis',
    TREND_ANALYSIS = 'trend_analysis'
}

export enum AIUsageScenario {
    // 使用场景
    BLOG_WRITING = 'blog_writing',
    TECHNICAL_QA = 'tech_qa',
    CREATIVE_WRITING = 'creative',
    CODE_ASSISTANCE = 'code_help',
    LEARNING = 'learning',
    BRAINSTORMING = 'brainstorm',
    DEBUGGING = 'debugging',
    OPTIMIZATION = 'optimization'
}

export enum UserActivityLevel {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
    INACTIVE = 'inactive'
}

export enum TimeRange {
    HOUR = 'hour',
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
    QUARTER = 'quarter',
    YEAR = 'year'
}

// 基础使用指标
export interface BasicUsageMetrics {
    // 使用量指标
    totalSessions: number;
    totalMessages: number;
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    returningUsers: number;

    // Token 相关
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    avgTokensPerMessage: number;
    avgTokensPerSession: number;

    // 成本相关
    totalCost: number;
    avgCostPerMessage: number;
    avgCostPerUser: number;
    avgCostPerSession: number;
    costByModel: Record<string, number>;

    // 时间相关
    totalDuration: number; // 总时长(秒)
    avgSessionDuration: number;
    avgMessageInterval: number;
}

// 性能质量指标
export interface PerformanceMetrics {
    // 响应时间
    avgResponseTime: number;
    medianResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;

    // 成功率
    successRate: number;
    errorRate: number;
    timeoutRate: number;
    retryRate: number;

    // 用户满意度
    avgUserRating: number;
    satisfactionRate: number;
    npsScore: number;
    feedbackCount: number;

    // 模型性能
    modelAccuracy: number;
    responseRelevance: number;
    contextUnderstanding: number;
    contentQuality: number;
}

// 业务价值指标
export interface BusinessMetrics {
    // 用户参与度
    userRetentionRate: Record<string, number>; // 1天、7天、30天留存率
    sessionDuration: number;
    messagesPerSession: number;
    returningUserRate: number;
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;

    // 功能采用度
    featureAdoptionRate: Record<AIFeatureType, number>;
    featureUsageFrequency: Record<AIFeatureType, number>;
    crossFeatureUsage: number;
    featureStickiness: Record<AIFeatureType, number>;

    // 业务转化
    taskCompletionRate: number;
    userProductivity: number;
    contentGenerationRate: number;
    problemSolvingRate: number;

    // 成本效益
    costPerActiveUser: number;
    revenuePerUser: number;
    roi: number;
    lifetimeValue: number;
}

// AI交互事件
export interface AIInteractionEvent {
    id: string;
    userId: string;
    sessionId: string;
    conversationId?: string;
    featureType: AIFeatureType;
    scenario: AIUsageScenario;
    model: string;
    timestamp: Date;

    // 请求信息
    requestData: {
        inputLength: number;
        inputTokens: number;
        temperature: number;
        maxTokens: number;
        promptCategory: string;
        isFirstMessage: boolean;
    };

    // 响应信息
    responseData: {
        outputLength: number;
        outputTokens: number;
        responseTime: number;
        finishReason: string;
        streamingTime?: number;
    };

    // 质量信息
    qualityData: {
        userRating?: number;
        feedback?: string;
        isSuccessful: boolean;
        errorCode?: string;
        confidence?: number;
        relevanceScore?: number;
    };

    // 上下文信息
    contextData: {
        conversationLength: number;
        deviceType: string;
        userAgent: string;
        referrer?: string;
        timezone: string;
    };

    // 成本信息
    costData: {
        inputCost: number;
        outputCost: number;
        totalCost: number;
        provider: string;
    };
}

// 用户统计详情
export interface UserStatisticsDetail extends BasicUsageMetrics, PerformanceMetrics, BusinessMetrics {
    userId: string;
    date: Date;
    timeRange: TimeRange;

    // 用户特征
    userProfile: {
        registrationDate: Date;
        lastActiveDate: Date;
        activityLevel: UserActivityLevel;
        preferredModels: string[];
        primaryUseCase: AIUsageScenario;
        expertiseLevel: 'beginner' | 'intermediate' | 'advanced';
    };

    // 使用模式
    usagePatterns: {
        peakHours: number[];
        preferredFeatures: AIFeatureType[];
        sessionLengthDistribution: Record<string, number>;
        messageTypeDistribution: Record<string, number>;
    };

    // 成长轨迹
    growthMetrics: {
        weekOverWeekGrowth: number;
        monthOverMonthGrowth: number;
        skillProgressionScore: number;
        learningVelocity: number;
    };
}

// 模型统计详情
export interface ModelStatisticsDetail {
    model: string;
    provider: string;
    date: Date;
    timeRange: TimeRange;

    // 基础指标
    usage: BasicUsageMetrics;
    performance: PerformanceMetrics;
    business: BusinessMetrics;

    // 模型特定指标
    modelMetrics: {
        // 技术指标
        throughput: number; // 吞吐量
        latency: number; // 延迟
        availability: number; // 可用性
        scalability: number; // 扩展性

        // 质量指标
        accuracy: number;
        relevance: number;
        creativity: number;
        consistency: number;

        // 成本指标
        costPerToken: number;
        costEfficiency: number;
        budgetUtilization: number;
    };

    // 使用分布
    usageDistribution: {
        byFeature: Record<AIFeatureType, number>;
        byScenario: Record<AIUsageScenario, number>;
        byUserSegment: Record<string, number>;
        byTimeOfDay: Record<number, number>;
    };

    // 比较基准
    benchmarks: {
        industryAverage: PerformanceMetrics;
        internalBaseline: PerformanceMetrics;
        competitorComparison: Record<string, PerformanceMetrics>;
    };
}

// 趋势分析
export interface TrendAnalysis {
    metric: string;
    timeRange: TimeRange;
    dataPoints: Array<{
        timestamp: Date;
        value: number;
        change: number;
        changePercent: number;
    }>;

    // 趋势特征
    trendCharacteristics: {
        direction: 'up' | 'down' | 'stable' | 'volatile';
        strength: number; // 趋势强度 0-1
        volatility: number; // 波动性 0-1
        seasonality: boolean;
        cycleLength?: number;
    };

    // 预测
    forecast: {
        nextPeriod: number;
        confidence: number;
        upperBound: number;
        lowerBound: number;
        factors: string[]; // 影响因素
    };
}

// 异常检测
export interface AnomalyDetection {
    timestamp: Date;
    metric: string;
    actualValue: number;
    expectedValue: number;
    deviation: number;
    severity: 'low' | 'medium' | 'high' | 'critical';

    // 异常详情
    details: {
        type: 'spike' | 'drop' | 'trend_change' | 'outlier';
        duration: number;
        affectedUsers: number;
        rootCause?: string;
        impact: string;
    };

    // 建议措施
    recommendations: Array<{
        action: string;
        priority: 'low' | 'medium' | 'high';
        estimatedImpact: string;
    }>;
}

// 洞察报告
export interface InsightReport {
    id: string;
    title: string;
    type: 'performance' | 'usage' | 'cost' | 'quality' | 'business';
    category: 'opportunity' | 'risk' | 'optimization' | 'trend';
    priority: 'low' | 'medium' | 'high' | 'critical';

    // 洞察内容
    insight: {
        summary: string;
        description: string;
        evidence: string[];
        impact: string;
        confidence: number;
    };

    // 数据支持
    supportingData: {
        metrics: Record<string, number>;
        trends: TrendAnalysis[];
        comparisons: Record<string, number>;
    };

    // 行动建议
    actionItems: Array<{
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high';
        effort: 'low' | 'medium' | 'high';
        expectedImpact: string;
        timeline: string;
    }>;

    // 元数据
    metadata: {
        generatedAt: Date;
        validUntil: Date;
        confidence: number;
        dataRange: {
            start: Date;
            end: Date;
        };
    };
}

// 统计查询参数
export interface StatisticsQuery {
    timeRange: TimeRange;
    startDate: Date;
    endDate: Date;

    // 过滤条件
    filters?: {
        userIds?: string[];
        models?: string[];
        features?: AIFeatureType[];
        scenarios?: AIUsageScenario[];
        userSegments?: string[];
    };

    // 聚合选项
    aggregation?: {
        groupBy: 'user' | 'model' | 'feature' | 'scenario' | 'time';
        timeGranularity?: 'hour' | 'day' | 'week' | 'month';
        includeComparisons?: boolean;
        includeTrends?: boolean;
        includeForecasts?: boolean;
    };

    // 输出选项
    output?: {
        format: 'json' | 'csv' | 'excel' | 'pdf';
        includeCharts?: boolean;
        includeInsights?: boolean;
        includeRecommendations?: boolean;
    };
}

// API响应类型
export interface StatisticsResponse {
    success: boolean;
    data: {
        basic: BasicUsageMetrics;
        performance: PerformanceMetrics;
        business: BusinessMetrics;
        trends?: TrendAnalysis[];
        anomalies?: AnomalyDetection[];
        insights?: InsightReport[];
    };
    metadata: {
        queryTime: number;
        dataPoints: number;
        lastUpdated: Date;
        nextUpdate?: Date;
    };
    errors?: string[];
    warnings?: string[];
}

// 实时统计数据
export interface RealTimeStats {
    timestamp: Date;

    // 实时指标
    live: {
        activeUsers: number;
        activeSessions: number;
        requestsPerMinute: number;
        avgResponseTime: number;
        errorRate: number;
        currentCost: number;
    };

    // 近期趋势
    recent: {
        last5Minutes: BasicUsageMetrics;
        last15Minutes: BasicUsageMetrics;
        lastHour: BasicUsageMetrics;
    };

    // 系统状态
    system: {
        modelStatus: Record<string, 'healthy' | 'degraded' | 'down'>;
        apiLatency: Record<string, number>;
        queueLength: number;
        resourceUtilization: number;
    };
}
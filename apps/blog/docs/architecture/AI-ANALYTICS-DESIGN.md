# 🎯 AI使用统计规则和逻辑设计

## 1. AI功能分类统计体系

### 1.1 功能分类定义

```typescript
enum AIFeatureType {
  // 对话类功能
  CHAT = 'chat',                    // AI聊天对话
  WRITING_ASSISTANT = 'writing',     // 写作助手
  
  // 编程类功能 (未来扩展)
  CODE_GENERATION = 'code_gen',      // 代码生成
  CODE_REVIEW = 'code_review',       // 代码审查
  CODE_COMPLETION = 'code_complete', // 代码补全
  
  // 内容类功能 (未来扩展)
  CONTENT_GENERATION = 'content_gen', // 内容生成
  CONTENT_OPTIMIZATION = 'content_opt', // 内容优化
  SEO_OPTIMIZATION = 'seo_opt',      // SEO优化
  
  // 分析类功能 (未来扩展)
  PERFORMANCE_ANALYSIS = 'perf_analysis', // 性能分析
  DATA_ANALYSIS = 'data_analysis',   // 数据分析
  TREND_ANALYSIS = 'trend_analysis'  // 趋势分析
}

enum AIUsageScenario {
  // 使用场景
  BLOG_WRITING = 'blog_writing',     // 博客写作
  TECHNICAL_QA = 'tech_qa',          // 技术问答  
  CREATIVE_WRITING = 'creative',     // 创意写作
  CODE_ASSISTANCE = 'code_help',     // 编程辅助
  LEARNING = 'learning',             // 学习辅助
  BRAINSTORMING = 'brainstorm',      // 头脑风暴
  DEBUGGING = 'debugging',           // 调试帮助
  OPTIMIZATION = 'optimization'      // 优化建议
}
```

### 1.2 统计维度定义

#### 时间维度
- **实时统计**: 当前活跃会话数、实时请求数
- **小时级**: 每小时使用量趋势
- **日级**: 每日使用统计
- **周级**: 每周使用趋势
- **月级**: 月度统计报告
- **年级**: 年度使用分析

#### 用户维度
- **个人统计**: 每个用户的AI使用情况
- **用户分群**: 按使用频率、使用场景分群
- **行为模式**: 用户使用习惯和偏好
- **生命周期**: 新用户、活跃用户、流失用户

#### 功能维度
- **功能使用率**: 各AI功能的使用频率
- **功能效果**: 用户满意度和成功率
- **功能对比**: 不同功能间的使用对比

#### 性能维度
- **响应性能**: 响应时间分布和趋势
- **模型性能**: 不同模型的表现对比
- **成本效益**: 成本与效果的关系分析

## 2. 核心统计指标体系

### 2.1 基础使用指标

```typescript
interface BasicUsageMetrics {
  // 使用量指标
  totalSessions: number;           // 总会话数
  totalMessages: number;           // 总消息数
  totalUsers: number;              // 总用户数
  activeUsers: number;             // 活跃用户数
  
  // Token 相关
  totalTokens: number;             // 总Token数
  inputTokens: number;             // 输入Token数
  outputTokens: number;            // 输出Token数
  avgTokensPerMessage: number;     // 平均每消息Token数
  
  // 成本相关
  totalCost: number;               // 总成本
  avgCostPerMessage: number;       // 平均每消息成本
  avgCostPerUser: number;          // 平均每用户成本
  costByModel: Record<string, number>; // 按模型分组成本
}
```

### 2.2 性能质量指标

```typescript
interface PerformanceMetrics {
  // 响应时间
  avgResponseTime: number;         // 平均响应时间
  medianResponseTime: number;      // 中位响应时间
  p95ResponseTime: number;         // 95%分位响应时间
  p99ResponseTime: number;         // 99%分位响应时间
  
  // 成功率
  successRate: number;             // 成功率
  errorRate: number;               // 错误率
  timeoutRate: number;             // 超时率
  
  // 用户满意度
  avgUserRating: number;           // 平均用户评分
  satisfactionRate: number;        // 满意度比例
  npsScore: number;                // 净推荐值
  
  // 模型性能
  modelAccuracy: number;           // 模型准确度
  responseRelevance: number;       // 回复相关度
  contextUnderstanding: number;    // 上下文理解度
}
```

### 2.3 业务价值指标

```typescript
interface BusinessMetrics {
  // 用户参与度
  userRetentionRate: number;       // 用户留存率
  sessionDuration: number;         // 会话持续时间
  messagesPerSession: number;      // 每会话消息数
  returningUserRate: number;       // 回访用户率
  
  // 功能采用度
  featureAdoptionRate: Record<AIFeatureType, number>; // 功能采用率
  featureUsageFrequency: Record<AIFeatureType, number>; // 功能使用频率
  crossFeatureUsage: number;       // 跨功能使用率
  
  // 业务转化
  taskCompletionRate: number;      // 任务完成率
  userProductivity: number;        // 用户生产力提升
  contentGenerationRate: number;   // 内容生成效率
  
  // 成本效益
  costPerActiveUser: number;       // 每活跃用户成本
  revenuePerUser: number;          // 每用户收入
  roi: number;                     // 投资回报率
}
```

## 3. 统计规则和计算逻辑

### 3.1 数据收集规则

#### 实时数据收集
```typescript
// 每次AI交互时收集的数据
interface AIInteractionEvent {
  userId: string;
  sessionId: string;
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
    prompt: string; // 脱敏后的提示
  };
  
  // 响应信息
  responseData: {
    outputLength: number;
    outputTokens: number;
    responseTime: number;
    finishReason: string;
    response: string; // 脱敏后的回复
  };
  
  // 质量信息
  qualityData: {
    userRating?: number;
    feedback?: string;
    isSuccessful: boolean;
    errorCode?: string;
    confidence?: number;
  };
  
  // 上下文信息
  contextData: {
    conversationLength: number;
    previousContext: string;
    deviceType: string;
    userAgent: string;
  };
}
```

#### 批量数据处理
```typescript
// 定时任务处理统计数据
interface StatisticsProcessingRules {
  // 每小时执行
  hourlyProcessing: {
    aggregateHourlyMetrics: boolean;
    cleanupOldSessions: boolean;
    updateRealTimeStats: boolean;
  };
  
  // 每日执行
  dailyProcessing: {
    generateDailyReports: boolean;
    updateUserStatistics: boolean;
    calculateTrends: boolean;
    performDataAnalysis: boolean;
  };
  
  // 每周执行
  weeklyProcessing: {
    generateWeeklyInsights: boolean;
    updateUserSegments: boolean;
    performCohortAnalysis: boolean;
  };
  
  // 每月执行
  monthlyProcessing: {
    generateMonthlyReports: boolean;
    calculateBusinessMetrics: boolean;
    performPredictiveAnalysis: boolean;
  };
}
```

### 3.2 统计计算逻辑

#### 用户活跃度计算
```typescript
class UserActivityCalculator {
  // 计算用户活跃度分数
  calculateActivityScore(userId: string, period: 'day' | 'week' | 'month'): number {
    const weights = {
      sessionCount: 0.3,      // 会话数权重
      messageCount: 0.25,     // 消息数权重
      sessionDuration: 0.2,   // 会话时长权重
      featureUsage: 0.15,     // 功能使用多样性权重
      userRating: 0.1         // 用户评分权重
    };
    
    // 根据权重计算综合活跃度分数
    // 实现具体计算逻辑...
  }
  
  // 用户分级
  classifyUser(activityScore: number): 'high' | 'medium' | 'low' | 'inactive' {
    if (activityScore >= 80) return 'high';
    if (activityScore >= 60) return 'medium';
    if (activityScore >= 30) return 'low';
    return 'inactive';
  }
}
```

#### 模型性能评估
```typescript
class ModelPerformanceEvaluator {
  // 计算模型综合评分
  calculateModelScore(model: string, period: string): ModelScore {
    return {
      performanceScore: this.calculatePerformanceScore(model, period),
      qualityScore: this.calculateQualityScore(model, period),
      costEfficiencyScore: this.calculateCostEfficiencyScore(model, period),
      userSatisfactionScore: this.calculateUserSatisfactionScore(model, period)
    };
  }
  
  // 性能评分 (响应时间、成功率)
  calculatePerformanceScore(model: string, period: string): number {
    // 响应时间评分 (越快越好)
    const responseTimeScore = this.normalizeResponseTime(model, period);
    // 成功率评分
    const successRateScore = this.getSuccessRate(model, period);
    
    return (responseTimeScore * 0.6 + successRateScore * 0.4);
  }
  
  // 质量评分 (用户评分、回复相关度)
  calculateQualityScore(model: string, period: string): number {
    const userRatingScore = this.getAverageUserRating(model, period);
    const relevanceScore = this.calculateRelevanceScore(model, period);
    
    return (userRatingScore * 0.7 + relevanceScore * 0.3);
  }
}
```

### 3.3 异常检测和告警

```typescript
interface AnomalyDetectionRules {
  // 性能异常
  performanceAnomalies: {
    responseTimeThreshold: 5000;    // 响应时间超过5秒
    errorRateThreshold: 0.05;       // 错误率超过5%
    costSpikeThreshold: 2.0;        // 成本突增2倍
  };
  
  // 使用异常
  usageAnomalies: {
    requestSpike: 5.0;              // 请求量突增5倍
    userActivityDrop: 0.3;          // 用户活跃度下降70%
    tokenUsageSpike: 3.0;           // Token使用突增3倍
  };
  
  // 质量异常
  qualityAnomalies: {
    ratingDrop: 0.5;                // 评分下降0.5分
    satisfactionDrop: 0.2;          // 满意度下降20%
    completionRateDrop: 0.3;        // 完成率下降30%
  };
}
```

## 4. 数据存储优化方案

### 4.1 时序数据存储

```typescript
// 时序统计数据表设计
interface TimeSeriesStatistics {
  // 分钟级统计 (保留7天)
  minutelyStats: {
    timestamp: Date;
    activeUsers: number;
    requestCount: number;
    errorCount: number;
    avgResponseTime: number;
  };
  
  // 小时级统计 (保留30天)
  hourlyStats: {
    timestamp: Date;
    totalSessions: number;
    totalMessages: number;
    totalTokens: number;
    totalCost: number;
    modelUsage: Record<string, number>;
  };
  
  // 日级统计 (保留1年)
  dailyStats: {
    date: Date;
    userMetrics: BasicUsageMetrics;
    performanceMetrics: PerformanceMetrics;
    businessMetrics: BusinessMetrics;
  };
  
  // 月级统计 (永久保留)
  monthlyStats: {
    month: string; // YYYY-MM
    aggregatedMetrics: AllMetrics;
    trends: TrendAnalysis;
    insights: InsightReport;
  };
}
```

### 4.2 数据分区和索引策略

```sql
-- 时间分区表设计
CREATE TABLE ai_usage_events (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    feature_type VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    input_tokens INTEGER,
    output_tokens INTEGER,
    response_time INTEGER,
    cost DECIMAL(10,6),
    success BOOLEAN,
    user_rating INTEGER
) PARTITION BY RANGE (timestamp);

-- 按月分区
CREATE TABLE ai_usage_events_2024_01 PARTITION OF ai_usage_events
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- 索引优化
CREATE INDEX idx_ai_usage_user_time ON ai_usage_events (user_id, timestamp DESC);
CREATE INDEX idx_ai_usage_feature_time ON ai_usage_events (feature_type, timestamp DESC);
CREATE INDEX idx_ai_usage_model_time ON ai_usage_events (model, timestamp DESC);
```

## 5. 可视化展示规划

### 5.1 仪表板设计

#### 总览仪表板
- **实时指标卡片**: 当前活跃用户、实时请求数、系统状态
- **使用趋势图**: 24小时、7天、30天使用趋势
- **模型使用分布**: 各模型使用占比
- **成本监控**: 实时成本和预算对比

#### 用户分析仪表板
- **用户活跃度热图**: 按时间显示用户活跃情况
- **用户分群分析**: 不同用户群体的使用模式
- **用户行为路径**: 用户在不同功能间的使用路径
- **留存率分析**: 用户留存趋势和流失分析

#### 模型性能仪表板
- **模型对比雷达图**: 多维度模型性能对比
- **响应时间分布**: 响应时间的分布情况
- **成功率趋势**: 各模型成功率变化
- **成本效益分析**: 成本与效果的关系图

#### 业务价值仪表板
- **ROI趋势图**: 投资回报率变化
- **生产力提升**: AI对用户生产力的影响
- **功能价值排名**: 各功能带来的业务价值
- **预测分析**: 未来趋势预测

### 5.2 报告系统

#### 自动化报告
- **日报**: 每日关键指标汇总
- **周报**: 周度趋势分析和异常报告
- **月报**: 月度全面分析报告
- **季报**: 季度业务价值分析

#### 自定义报告
- **按需生成**: 用户可自定义时间范围和指标
- **导出功能**: 支持PDF、Excel、CSV等格式
- **邮件订阅**: 定期发送报告到邮箱
- **分享功能**: 报告链接分享

## 6. 实施优先级

### Phase 1: 基础统计 (2周)
1. 完善现有数据收集
2. 实现核心指标计算
3. 基础可视化组件

### Phase 2: 深度分析 (3周)
1. 用户行为分析
2. 模型性能评估
3. 异常检测系统

### Phase 3: 高级功能 (4周)
1. 预测分析
2. 自动化报告
3. 实时监控告警

### Phase 4: 优化完善 (2周)
1. 性能优化
2. 用户体验优化
3. 系统稳定性提升
// AI统计数据React Hook

import {
    AIFeatureType,
    AIUsageScenario,
    ModelStatisticsDetail,
    RealTimeStats,
    StatisticsResponse,
    TimeRange,
    UserStatisticsDetail
} from '@/types/ai-analytics';
import { useCallback, useEffect, useState } from 'react';
import { ensureCsrfToken, getCsrfHeaderName } from '@/utils/csrf';

interface UseAIAnalyticsOptions {
    timeRange?: TimeRange;
    autoRefresh?: boolean;
    refreshInterval?: number; // 毫秒
    includeInsights?: boolean;
    includeTrends?: boolean;
}

interface AnalyticsError {
    message: string;
    code?: string;
    details?: any;
}

const CSRF_HEADER_NAME = getCsrfHeaderName();

export function useAIAnalytics(options: UseAIAnalyticsOptions = {}) {
    const {
        timeRange = TimeRange.WEEK,
        autoRefresh = false,
        refreshInterval = 5 * 60 * 1000, // 5分钟
        includeInsights = false,
        includeTrends = false
    } = options;

    const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<AnalyticsError | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchStatistics = useCallback(async (customParams?: {
        timeRange?: TimeRange;
        startDate?: Date;
        endDate?: Date;
        models?: string[];
        features?: AIFeatureType[];
        scenarios?: AIUsageScenario[];
    }) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                timeRange: customParams?.timeRange || timeRange,
                includeInsights: (customParams ? false : includeInsights).toString(),
                includeTrends: (customParams ? false : includeTrends).toString(),
            });

            if (customParams?.startDate) {
                params.append('startDate', customParams.startDate.toISOString());
            }
            if (customParams?.endDate) {
                params.append('endDate', customParams.endDate.toISOString());
            }
            if (customParams?.models?.length) {
                params.append('models', customParams.models.join(','));
            }
            if (customParams?.features?.length) {
                params.append('features', customParams.features.join(','));
            }
            if (customParams?.scenarios?.length) {
                params.append('scenarios', customParams.scenarios.join(','));
            }

            const response = await fetch(`/api/ai-analytics/stats?${params}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data: StatisticsResponse = await response.json();

            if (!data.success) {
                throw new Error(data.errors?.join(', ') || 'Failed to fetch statistics');
            }

            setStatistics(data);
            setLastUpdated(new Date());
        } catch (err) {
            const error: AnalyticsError = {
                message: err instanceof Error ? err.message : 'Unknown error occurred',
                details: err
            };
            setError(error);
            console.error('Failed to fetch AI analytics:', err);
        } finally {
            setLoading(false);
        }
    }, [timeRange, includeInsights, includeTrends]);

    // 初始加载和自动刷新
    useEffect(() => {
        fetchStatistics();

        if (autoRefresh && refreshInterval > 0) {
            const interval = setInterval(fetchStatistics, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchStatistics, autoRefresh, refreshInterval]);

    const refresh = useCallback(() => {
        return fetchStatistics();
    }, [fetchStatistics]);

    const query = useCallback((params: {
        timeRange?: TimeRange;
        startDate?: Date;
        endDate?: Date;
        models?: string[];
        features?: AIFeatureType[];
        scenarios?: AIUsageScenario[];
    }) => {
        return fetchStatistics(params);
    }, [fetchStatistics]);

    return {
        statistics,
        loading,
        error,
        lastUpdated,
        refresh,
        query
    };
}

export function useUserStatistics(userId?: string, options: UseAIAnalyticsOptions = {}) {
    const { timeRange = TimeRange.WEEK } = options;
    const [userStats, setUserStats] = useState<UserStatisticsDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<AnalyticsError | null>(null);

    const fetchUserStats = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                timeRange,
                userIds: userId
            });

            const response = await fetch(`/api/ai-analytics/stats?${params}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch user statistics');
            }

            setUserStats(data.data);
        } catch (err) {
            setError({
                message: err instanceof Error ? err.message : 'Unknown error occurred',
                details: err
            });
        } finally {
            setLoading(false);
        }
    }, [userId, timeRange]);

    useEffect(() => {
        fetchUserStats();
    }, [fetchUserStats]);

    return {
        userStats,
        loading,
        error,
        refresh: fetchUserStats
    };
}

export function useModelStatistics(model: string, options: UseAIAnalyticsOptions = {}) {
    const { timeRange = TimeRange.WEEK } = options;
    const [modelStats, setModelStats] = useState<ModelStatisticsDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<AnalyticsError | null>(null);

    const fetchModelStats = useCallback(async () => {
        if (!model) return;

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                timeRange,
                model
            });

            const response = await fetch(`/api/ai-analytics/model-stats?${params}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch model statistics');
            }

            setModelStats(data.data);
        } catch (err) {
            setError({
                message: err instanceof Error ? err.message : 'Unknown error occurred',
                details: err
            });
        } finally {
            setLoading(false);
        }
    }, [model, timeRange]);

    useEffect(() => {
        fetchModelStats();
    }, [fetchModelStats]);

    return {
        modelStats,
        loading,
        error,
        refresh: fetchModelStats
    };
}

export function useRealTimeStats(options: { autoRefresh?: boolean; refreshInterval?: number } = {}) {
    const { autoRefresh = true, refreshInterval = 30 * 1000 } = options; // 30秒刷新
    const [realTimeStats, setRealTimeStats] = useState<RealTimeStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<AnalyticsError | null>(null);

    const fetchRealTimeStats = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/ai-analytics/realtime', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch real-time statistics');
            }

            setRealTimeStats(data.data);
        } catch (err) {
            setError({
                message: err instanceof Error ? err.message : 'Unknown error occurred',
                details: err
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRealTimeStats();

        if (autoRefresh && refreshInterval > 0) {
            const interval = setInterval(fetchRealTimeStats, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchRealTimeStats, autoRefresh, refreshInterval]);

    return {
        realTimeStats,
        loading,
        error,
        refresh: fetchRealTimeStats
    };
}

// 用于记录AI交互的Hook
export function useAIInteractionTracker() {
    const trackInteraction = useCallback(async (eventData: {
        sessionId?: string;
        conversationId?: string;
        featureType?: AIFeatureType;
        scenario?: AIUsageScenario;
        model: string;
        inputText: string;
        outputText: string;
        inputTokens: number;
        outputTokens: number;
        responseTime: number;
        isSuccessful?: boolean;
        userRating?: number;
        feedback?: string;
        temperature?: number;
        maxTokens?: number;
        finishReason?: string;
        conversationLength?: number;
        isFirstMessage?: boolean;
        timezone?: string;
    }) => {
        try {
            const csrfToken = await ensureCsrfToken();
            const response = await fetch('/api/ai-analytics/collect', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrfToken ? { [CSRF_HEADER_NAME]: csrfToken } : {}),
                },
                body: JSON.stringify({
                    ...eventData,
                    timezone: eventData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
                })
            });

            if (!response.ok) {
                console.error('Failed to track AI interaction:', response.statusText);
            }

            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Error tracking AI interaction:', error);
            return false;
        }
    }, []);

    return { trackInteraction };
}

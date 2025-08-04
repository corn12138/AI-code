'use client';

import { useAuth } from '@corn12138/hooks';
import {
    ArrowLeftIcon,
    ArrowTrendingDownIcon,
    ArrowTrendingUpIcon,
    CalendarIcon,
    ChatBubbleLeftRightIcon,
    ClockIcon,
    CurrencyDollarIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface AnalyticsData {
    usage: {
        totalRequests: number;
        totalTokens: number;
        totalCost: number;
        avgResponseTime: number;
        dailyTrend: Array<{
            date: string;
            requests: number;
            tokens: number;
            cost: number;
            responseTime: number;
        }>;
        weeklyComparison: {
            current: number;
            previous: number;
            change: number;
        };
    };
    models: Array<{
        name: string;
        requests: number;
        successRate: number;
        avgResponseTime: number;
        cost: number;
        trend: 'up' | 'down' | 'stable';
    }>;
    content: {
        totalArticles: number;
        totalDrafts: number;
        publishingRate: number;
        avgWordsPerArticle: number;
        topCategories: Array<{
            name: string;
            count: number;
            percentage: number;
        }>;
    };
    performance: {
        peakHours: Array<{
            hour: number;
            requests: number;
        }>;
        errorRate: number;
        uptime: number;
    };
}

export default function AdvancedAnalytics() {
    const { user } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
    const [selectedMetric, setSelectedMetric] = useState<'requests' | 'tokens' | 'cost'>('requests');

    useEffect(() => {
        fetchAnalyticsData();
    }, [timeRange]);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);

            // 从真实API获取数据
            const response = await fetch(`/api/analytics?timeRange=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analytics data');
            }

            const apiData = await response.json();

            // 转换API数据格式为组件期望的格式
            const transformedData: AnalyticsData = {
                usage: {
                    totalRequests: apiData.usage.totalRequests,
                    totalTokens: apiData.usage.totalTokens,
                    totalCost: apiData.usage.totalCost,
                    avgResponseTime: apiData.usage.avgResponseTime,
                    dailyTrend: apiData.usage.dailyTrend,
                    weeklyComparison: apiData.usage.weeklyComparison
                },
                models: apiData.models || [],
                content: apiData.content || {
                    totalArticles: 0,
                    totalDrafts: 0,
                    publishingRate: 0,
                    avgWordsPerArticle: 0,
                    topCategories: []
                },
                performance: apiData.performance || {
                    peakHours: [],
                    errorRate: 0,
                    uptime: 99.9
                }
            };

            setData(transformedData);
        } catch (error) {
            console.error('获取分析数据失败:', error);

            // 如果API失败，显示空数据而不是模拟数据
            const emptyData: AnalyticsData = {
                usage: {
                    totalRequests: 0,
                    totalTokens: 0,
                    totalCost: 0,
                    avgResponseTime: 0,
                    dailyTrend: [],
                    weeklyComparison: { current: 0, previous: 0, change: 0 }
                },
                models: [],
                content: {
                    totalArticles: 0,
                    totalDrafts: 0,
                    publishingRate: 0,
                    avgWordsPerArticle: 0,
                    topCategories: []
                },
                performance: {
                    peakHours: Array(24).fill(0).map((_, hour) => ({ hour, requests: 0 })),
                    errorRate: 0,
                    uptime: 0
                }
            };
            setData(emptyData);
        } finally {
            setLoading(false);
        }
    };

    const generateDailyTrend = () => {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const trend = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            trend.push({
                date: date.toISOString().split('T')[0],
                requests: Math.floor(Math.random() * 50) + 20,
                tokens: Math.floor(Math.random() * 3000) + 1000,
                cost: (Math.random() * 2) + 0.5,
                responseTime: Math.random() * 1 + 1.5
            });
        }

        return trend;
    };

    const generatePeakHours = () => {
        const hours = [];
        for (let i = 0; i < 24; i++) {
            let requests = Math.floor(Math.random() * 20) + 5;

            // 模拟工作时间高峰
            if (i >= 9 && i <= 18) {
                requests += Math.floor(Math.random() * 30) + 15;
            }

            hours.push({ hour: i, requests });
        }
        return hours;
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const getChangeIcon = (change: number) => {
        if (change > 0) return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
        if (change < 0) return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
        return <div className="h-4 w-4"></div>;
    };

    const getChangeColor = (change: number) => {
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-lg shadow p-6">
                        <div className="animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-32 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* 时间范围选择器 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        返回仪表板
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-900">高级数据分析</h2>
                </div>
                <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as any)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="7d">最近7天</option>
                        <option value="30d">最近30天</option>
                        <option value="90d">最近90天</option>
                    </select>
                </div>
            </div>

            {/* 关键指标卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">AI请求总数</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(data.usage.totalRequests)}</p>
                        </div>
                        <div className={`flex items-center space-x-1 text-sm ${getChangeColor(data.usage.weeklyComparison.change)}`}>
                            {getChangeIcon(data.usage.weeklyComparison.change)}
                            <span>{Math.abs(data.usage.weeklyComparison.change).toFixed(1)}%</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <ChatBubbleLeftRightIcon className="h-4 w-4" />
                            <span>较上周 {data.usage.weeklyComparison.change > 0 ? '增长' : '下降'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Token使用量</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(data.usage.totalTokens)}</p>
                        </div>
                        <DocumentTextIcon className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <span>平均每次: {Math.floor(data.usage.totalTokens / data.usage.totalRequests)} tokens</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">总费用</p>
                            <p className="text-2xl font-bold text-gray-900">${data.usage.totalCost.toFixed(2)}</p>
                        </div>
                        <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <span>单次平均: ${(data.usage.totalCost / data.usage.totalRequests).toFixed(4)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">平均响应时间</p>
                            <p className="text-2xl font-bold text-gray-900">{data.usage.avgResponseTime.toFixed(1)}s</p>
                        </div>
                        <ClockIcon className="h-8 w-8 text-purple-500" />
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <span>系统正常运行: {data.performance.uptime}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 趋势图表 */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">使用趋势分析</h3>
                    <div className="flex items-center space-x-2">
                        <select
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value as any)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="requests">请求数量</option>
                            <option value="tokens">Token使用</option>
                            <option value="cost">费用支出</option>
                        </select>
                    </div>
                </div>

                {/* 简化的趋势图表 */}
                <div className="h-64 flex items-end space-x-1 border-b border-gray-200">
                    {data.usage.dailyTrend.slice(-7).map((day, index) => {
                        const maxValue = Math.max(...data.usage.dailyTrend.map(d => d[selectedMetric]));
                        const height = (day[selectedMetric] / maxValue) * 100;

                        return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer min-h-[4px]"
                                    style={{ height: `${height}%` }}
                                    title={`${new Date(day.date).toLocaleDateString()}: ${day[selectedMetric]}`}
                                />
                                <div className="text-xs text-gray-500 mt-2 transform rotate-45 origin-left">
                                    {new Date(day.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 模型性能对比 */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">AI模型性能对比</h3>
                <div className="space-y-4">
                    {data.models.map((model, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                    <h4 className="font-medium text-gray-900">{model.name}</h4>
                                    <span className={`px-2 py-1 rounded-full text-xs ${model.trend === 'up' ? 'bg-green-100 text-green-800' :
                                        model.trend === 'down' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {model.trend === 'up' ? '↗ 上升' : model.trend === 'down' ? '↘ 下降' : '→ 稳定'}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    成功率: {model.successRate}%
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">请求数:</span>
                                    <span className="ml-1 font-medium">{model.requests.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">响应时间:</span>
                                    <span className="ml-1 font-medium">{model.avgResponseTime}s</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">费用:</span>
                                    <span className="ml-1 font-medium">${model.cost.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 内容统计 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">内容创作统计</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">总文章数</span>
                            <span className="font-medium">{data.content.totalArticles}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">草稿数</span>
                            <span className="font-medium">{data.content.totalDrafts}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">发布率</span>
                            <span className="font-medium">{data.content.publishingRate}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">平均字数</span>
                            <span className="font-medium">{data.content.avgWordsPerArticle.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">热门分类</h3>
                    <div className="space-y-3">
                        {data.content.topCategories.map((category, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" style={{
                                        backgroundColor: `hsl(${index * 120}, 70%, 50%)`
                                    }}></div>
                                    <span className="text-gray-900">{category.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">{category.count}</span>
                                    <span className="text-sm font-medium">{category.percentage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 使用时段分析 */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">24小时使用分布</h3>
                <div className="h-32 flex items-end space-x-1">
                    {data.performance.peakHours.map((hour, index) => {
                        const maxRequests = Math.max(...data.performance.peakHours.map(h => h.requests));
                        const height = (hour.requests / maxRequests) * 100;

                        return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all hover:from-blue-600 hover:to-blue-400 min-h-[2px]"
                                    style={{ height: `${height}%` }}
                                    title={`${hour.hour}:00 - ${hour.requests} 请求`}
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    {hour.hour}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
                    <span>🌅 早高峰: 9-11点</span>
                    <span>☀️ 午高峰: 14-16点</span>
                    <span>🌃 晚高峰: 19-21点</span>
                </div>
            </div>
        </div>
    );
} 
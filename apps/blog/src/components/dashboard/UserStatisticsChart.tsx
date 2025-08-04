'use client';

import { useState } from 'react';

interface UserStatisticsChartProps {
    userStats: any;
}

export function UserStatisticsChart({ userStats }: UserStatisticsChartProps) {
    const [selectedPeriod, setSelectedPeriod] = useState('week');

    const dailyStats = userStats?.dailyStats || [];

    // 获取最大值用于缩放
    const maxValue = Math.max(...dailyStats.map((stat: any) => stat.conversationCount || 0));

    return (
        <div className="bg-white overflow-hidden rounded-lg shadow">
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">用户使用趋势</h3>
                    <div className="flex space-x-2">
                        {['week', 'month', 'year'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-3 py-1 text-sm rounded-md ${selectedPeriod === period
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {period === 'week' ? '周' : period === 'month' ? '月' : '年'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    {dailyStats.length > 0 ? (
                        <div className="space-y-4">
                            {/* 图表区域 */}
                            <div className="h-64 flex items-end space-x-2 border-l border-b border-gray-200 pl-4 pb-4">
                                {dailyStats.slice(-7).map((stat: any, index: number) => {
                                    const height = maxValue > 0 ? (stat.conversationCount / maxValue) * 100 : 0;
                                    const date = new Date(stat.date);

                                    return (
                                        <div key={index} className="flex-1 flex flex-col items-center">
                                            <div
                                                className="w-full bg-blue-500 rounded-t-md transition-all duration-300 hover:bg-blue-600 min-h-[4px]"
                                                style={{ height: `${height}%` }}
                                                title={`${stat.conversationCount} 次对话`}
                                            />
                                            <div className="text-xs text-gray-500 mt-2 transform rotate-45 origin-left">
                                                {date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* 图例和数据 */}
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {userStats?.summary?.totalConversations || 0}
                                    </div>
                                    <div className="text-gray-500">总对话数</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {userStats?.summary?.totalTokens?.toLocaleString() || 0}
                                    </div>
                                    <div className="text-gray-500">总Token数</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        ${userStats?.summary?.totalCost?.toFixed(4) || '0.0000'}
                                    </div>
                                    <div className="text-gray-500">总费用</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-lg">暂无数据</div>
                            <p className="text-gray-500 text-sm mt-2">开始使用AI对话功能后，这里将显示您的使用统计</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 
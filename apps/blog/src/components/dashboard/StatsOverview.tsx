'use client';

import {
    ChatBubbleLeftRightIcon,
    ClockIcon,
    CurrencyDollarIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

interface StatsOverviewProps {
    userStats: any;
    modelStats: any;
}

export function StatsOverview({ userStats, modelStats }: StatsOverviewProps) {
    // 计算统计数据
    const totalConversations = userStats?.summary?.totalConversations || 0;
    const totalTokens = userStats?.summary?.totalTokens || 0;
    const totalCost = userStats?.summary?.totalCost || 0;
    const avgResponseTime = userStats?.summary?.avgResponseTime || 0;

    const stats = [
        {
            name: 'AI对话总数',
            value: totalConversations.toLocaleString(),
            icon: ChatBubbleLeftRightIcon,
            color: 'bg-blue-500',
            change: '+12%',
            changeType: 'positive'
        },
        {
            name: '使用Token数',
            value: totalTokens.toLocaleString(),
            icon: DocumentTextIcon,
            color: 'bg-green-500',
            change: '+5.4%',
            changeType: 'positive'
        },
        {
            name: '平均响应时间',
            value: `${avgResponseTime.toFixed(1)}s`,
            icon: ClockIcon,
            color: 'bg-yellow-500',
            change: '-2.1%',
            changeType: 'positive'
        },
        {
            name: '使用费用',
            value: `$${totalCost.toFixed(4)}`,
            icon: CurrencyDollarIcon,
            color: 'bg-purple-500',
            change: '+8.2%',
            changeType: 'negative'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
                <div key={stat.name} className="bg-white overflow-hidden rounded-lg shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className={`${stat.color} rounded-md p-3`}>
                                    <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        {stat.name}
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {stat.value}
                                        </div>
                                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {stat.change}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                查看详情
                            </a>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
} 
'use client';

import {
    ChatBubbleLeftRightIcon,
    ClockIcon,
    DocumentTextIcon,
    EyeIcon,
    PencilIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface Activity {
    id: string;
    type: 'chat' | 'article' | 'draft' | 'view';
    title: string;
    description: string;
    timestamp: string;
    metadata?: any;
}

export function RecentActivity() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 模拟获取最近活动数据
        const mockActivities: Activity[] = [
            {
                id: '1',
                type: 'chat',
                title: 'AI对话',
                description: '与AI助手讨论了React最佳实践',
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分钟前
            },
            {
                id: '2',
                type: 'draft',
                title: '保存草稿',
                description: '自动保存了文章《Next.js 开发指南》',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2小时前
            },
            {
                id: '3',
                type: 'article',
                title: '发布文章',
                description: '发布了新文章《React Hooks 深度解析》',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1天前
            },
            {
                id: '4',
                type: 'view',
                title: '文章浏览',
                description: '查看了文章《TypeScript 实战技巧》',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2天前
            },
            {
                id: '5',
                type: 'chat',
                title: 'AI对话',
                description: '请AI助手帮助优化代码性能',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3天前
            },
        ];

        // 模拟API调用延迟
        setTimeout(() => {
            setActivities(mockActivities);
            setLoading(false);
        }, 1000);
    }, []);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'chat':
                return ChatBubbleLeftRightIcon;
            case 'article':
                return DocumentTextIcon;
            case 'draft':
                return PencilIcon;
            case 'view':
                return EyeIcon;
            default:
                return ClockIcon;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'chat':
                return 'bg-blue-500';
            case 'article':
                return 'bg-green-500';
            case 'draft':
                return 'bg-yellow-500';
            case 'view':
                return 'bg-purple-500';
            default:
                return 'bg-gray-500';
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return '刚刚';
        if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}小时前`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}天前`;

        return time.toLocaleDateString('zh-CN');
    };

    return (
        <div className="bg-white overflow-hidden rounded-lg shadow">
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">最近活动</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-500">
                        查看全部
                    </button>
                </div>

                <div className="mt-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="animate-pulse flex space-x-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activities.length > 0 ? (
                        <div className="flow-root">
                            <ul className="-mb-8">
                                {activities.map((activity, index) => {
                                    const Icon = getActivityIcon(activity.type);

                                    return (
                                        <li key={activity.id}>
                                            <div className="relative pb-8">
                                                {index !== activities.length - 1 && (
                                                    <span
                                                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className={`${getActivityColor(activity.type)} h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white`}>
                                                            <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {activity.title}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {activity.description}
                                                            </p>
                                                        </div>
                                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                            {formatTimeAgo(activity.timestamp)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无活动记录</h3>
                            <p className="mt-1 text-sm text-gray-500">开始使用系统后，这里将显示您的操作记录</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 
'use client';

import { useAuth } from '@corn12138/hooks';
import {
    ChartBarIcon,
    ChatBubbleLeftIcon,
    ClockIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    PencilSquareIcon,
    SparklesIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import TopNavbar from '../../components/layout/TopNavbar';

export default function DashboardPage() {
    const { user, isLoading } = useAuth();
    const [userStats, setUserStats] = useState<any>(null);
    const [modelStats, setModelStats] = useState<any>(null);
    const [loading_, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchStats = async () => {
            try {
                setLoading(true);

                // 获取用户统计数据
                const userResponse = await fetch('/api/statistics/user?period=month', {
                    credentials: 'include',
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUserStats(userData);
                }

                // 获取模型统计数据
                const modelResponse = await fetch('/api/statistics/model?period=month', {
                    credentials: 'include',
                });

                if (modelResponse.ok) {
                    const modelData = await modelResponse.json();
                    setModelStats(modelData);
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    if (isLoading || loading_) {
        return (
            <div>
                <TopNavbar />
                <MainLayout>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div
                                data-testid="loading-spinner"
                                className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-500 mx-auto mb-4"
                            ></div>
                            <p className="text-space-400">加载统计数据中...</p>
                        </div>
                    </div>
                </MainLayout>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <TopNavbar />
                <MainLayout>
                    <div className="p-6">
                        <div className="bg-red-900/40 backdrop-blur-xl border border-red-500/20 rounded-2xl p-4">
                            <p className="text-red-300">加载数据时出错: {error}</p>
                        </div>
                    </div>
                </MainLayout>
            </div>
        );
    }

    const statsCards = [
        {
            title: 'AI对话总数',
            value: '0',
            icon: ChatBubbleLeftIcon,
            color: 'cosmic',
            bgColor: 'bg-cosmic-500/20',
            textColor: 'text-cosmic-300'
        },
        {
            title: '使用Token数',
            value: '0',
            icon: SparklesIcon,
            color: 'nebula',
            bgColor: 'bg-nebula-500/20',
            textColor: 'text-nebula-300'
        },
        {
            title: '平均响应时间',
            value: '0s',
            icon: ClockIcon,
            color: 'stardust',
            bgColor: 'bg-stardust-500/20',
            textColor: 'text-stardust-300'
        },
        {
            title: '使用费用',
            value: '$0.0000',
            icon: CurrencyDollarIcon,
            color: 'space',
            bgColor: 'bg-space-500/20',
            textColor: 'text-space-300'
        }
    ];

    const quickActions = [
        {
            title: 'AI对话',
            description: '与AI助手聊天',
            href: '/chat',
            icon: ChatBubbleLeftIcon,
            bgColor: 'bg-cosmic-500/20 hover:bg-cosmic-500/30',
            textColor: 'text-cosmic-300',
            descColor: 'text-cosmic-400'
        },
        {
            title: '写文章',
            description: '创建新文章',
            href: '/editor',
            icon: PencilSquareIcon,
            bgColor: 'bg-nebula-500/20 hover:bg-nebula-500/30',
            textColor: 'text-nebula-300',
            descColor: 'text-nebula-400'
        },
        {
            title: '草稿管理',
            description: '管理草稿',
            href: '/dashboard/drafts',
            icon: DocumentTextIcon,
            bgColor: 'bg-stardust-500/20 hover:bg-stardust-500/30',
            textColor: 'text-stardust-300',
            descColor: 'text-stardust-400'
        },
        {
            title: '个人资料',
            description: '编辑个人信息',
            href: '/profile',
            icon: UserIcon,
            bgColor: 'bg-space-500/20 hover:bg-space-500/30',
            textColor: 'text-space-300',
            descColor: 'text-space-400'
        }
    ];

    return (
        <div
            data-testid="dashboard-page"
            className="bg-space-950"
        >
            <TopNavbar />
            <MainLayout showRightSidebar={false}>
                <div className="p-6">
                    {/* 页面头部 */}
                    <div className="mb-8">
                        <div className="flex items-center mb-4">
                            <ChartBarIcon className="h-8 w-8 text-cosmic-400 mr-3" />
                            <div>
                                <h1 className="text-3xl font-bold text-space-200">数据仪表板</h1>
                                <p className="text-space-400">查看您的使用统计和系统概览</p>
                            </div>
                        </div>

                        {user && (
                            <div
                                data-testid="welcome-card"
                                className="bg-gradient-to-r from-cosmic-500/20 to-nebula-500/20 backdrop-blur-xl rounded-2xl border border-cosmic-500/20 p-4"
                            >
                                <div className="flex items-center">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-cosmic-500 to-nebula-600 flex items-center justify-center text-white font-bold text-lg mr-4 shadow-cosmic">
                                        {(user as any)?.username?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-space-200">欢迎回来，{(user as any)?.username || 'User'}！</h2>
                                        <p className="text-space-400">今天也要继续探索AI的无限可能</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 统计卡片 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statsCards.map((stat, index) => (
                            <div
                                key={index}
                                data-testid={`stat-card-${index}`}
                                className="p-4 md:p-6 lg:p-8 bg-space-900/40 backdrop-blur-xl rounded-2xl border border-cosmic-500/20 hover:shadow-cosmic transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-space-400 mb-2">{stat.title}</h3>
                                        <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.bgColor} backdrop-blur-sm`}>
                                        <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* AI模型使用情况 */}
                        <div
                            data-testid="ai-usage-section"
                            className="p-4 md:p-6 lg:p-8 bg-space-900/40 backdrop-blur-xl rounded-2xl border border-cosmic-500/20"
                        >
                            <h3 className="text-lg font-semibold text-space-200 mb-4 flex items-center">
                                <SparklesIcon className="h-5 w-5 text-cosmic-400 mr-2" />
                                AI模型使用情况
                            </h3>
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-space-800/60 rounded-full flex items-center justify-center mx-auto mb-4 border border-cosmic-500/20">
                                    <ChartBarIcon className="h-8 w-8 text-space-400" />
                                </div>
                                <p className="text-space-400 mb-4">暂无模型使用数据</p>
                                <Link
                                    href="/chat"
                                    aria-label="开始AI对话"
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cosmic-600 to-nebula-600 text-white text-sm font-medium rounded-lg hover:from-cosmic-700 hover:to-nebula-700 transition-all duration-300 shadow-cosmic"
                                >
                                    开始AI对话
                                </Link>
                            </div>
                        </div>

                        {/* 最近活动 */}
                        <div
                            data-testid="recent-activities-section"
                            className="p-4 md:p-6 lg:p-8 bg-space-900/40 backdrop-blur-xl rounded-2xl border border-cosmic-500/20"
                        >
                            <h3 className="text-lg font-semibold text-space-200 mb-4 flex items-center">
                                <ClockIcon className="h-5 w-5 text-nebula-400 mr-2" />
                                最近活动
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center p-3 bg-space-800/40 rounded-xl border border-cosmic-500/20">
                                    <div className="w-2 h-2 bg-cosmic-400 rounded-full mr-3"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-space-300">欢迎使用数据仪表板</p>
                                        <p className="text-xs text-space-500">刚刚</p>
                                    </div>
                                </div>
                                <div className="text-center py-4">
                                    <p className="text-space-400 text-sm">开始使用AI功能，这里将显示您的活动记录</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 快速操作 */}
                    <div className="p-4 md:p-6 lg:p-8 bg-space-900/40 backdrop-blur-xl rounded-2xl border border-cosmic-500/20">
                        <h3 className="text-lg font-semibold text-space-200 mb-6 flex items-center">
                            <SparklesIcon className="h-5 w-5 text-stardust-400 mr-2" />
                            快速操作
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {quickActions.map((action, index) => (
                                <Link
                                    key={index}
                                    href={action.href}
                                    aria-label={`${action.title} - ${action.description}`}
                                    className={`${action.bgColor} backdrop-blur-sm rounded-xl p-6 text-center transition-all duration-300 group border border-cosmic-500/20 hover:shadow-cosmic`}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="mb-3">
                                            <action.icon className={`h-8 w-8 ${action.textColor} group-hover:scale-110 transition-transform`} />
                                        </div>
                                        <div className={`font-medium ${action.textColor} mb-1`}>{action.title}</div>
                                        <div className={`text-sm ${action.descColor}`}>{action.description}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </MainLayout>
        </div>
    );
} 

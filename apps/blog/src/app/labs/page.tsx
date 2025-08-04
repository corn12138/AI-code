'use client';

import {
    BeakerIcon,
    ExclamationTriangleIcon,
    LightBulbIcon,
    RocketLaunchIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import MainLayout from '../../components/layout/MainLayout';
import TopNavbar from '../../components/layout/TopNavbar';

export default function LabsPage() {
    const experiments = [
        {
            id: 'performance-monitor',
            title: '性能监控实验室',
            description: '实时监控系统性能，测试新的监控算法和可视化方案',
            status: 'active',
            participants: 23,
            href: '/dashboard/analytics'
        },
        {
            id: 'ai-pair-programming',
            title: 'AI结对编程',
            description: '体验与AI实时协作编程的全新模式',
            status: 'beta',
            participants: 156,
            href: '/labs/pair-programming'
        },
        {
            id: 'smart-debugging',
            title: '智能调试助手',
            description: 'AI驱动的代码错误检测和修复建议系统',
            status: 'experimental',
            participants: 42,
            href: '/labs/debugging'
        },
        {
            id: 'code-evolution',
            title: '代码演化分析',
            description: '追踪和可视化代码库的演化历程和改进建议',
            status: 'planning',
            participants: 0,
            href: '/labs/evolution'
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'beta':
                return 'bg-blue-100 text-blue-800';
            case 'experimental':
                return 'bg-yellow-100 text-yellow-800';
            case 'planning':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return '活跃';
            case 'beta':
                return 'Beta';
            case 'experimental':
                return '实验中';
            case 'planning':
                return '规划中';
            default:
                return '未知';
        }
    };

    const ExperimentCard = ({ experiment }: { experiment: typeof experiments[0] }) => (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="p-2 bg-purple-50 rounded-lg mr-3">
                        <BeakerIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{experiment.title}</h3>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(experiment.status)}`}>
                            {getStatusText(experiment.status)}
                        </span>
                    </div>
                </div>
            </div>

            <p className="text-gray-600 mb-4">
                {experiment.description}
            </p>

            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    {experiment.participants > 0 ? (
                        <span>{experiment.participants} 人参与</span>
                    ) : (
                        <span>等待启动</span>
                    )}
                </div>

                {experiment.status !== 'planning' ? (
                    <Link
                        href={experiment.href}
                        className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                    >
                        参与实验
                    </Link>
                ) : (
                    <button
                        disabled
                        className="inline-flex items-center px-3 py-1.5 bg-gray-300 text-gray-500 text-sm font-medium rounded-md cursor-not-allowed"
                    >
                        即将开放
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div>
            <TopNavbar />
            <MainLayout>
                <div className="p-6">
                    {/* 页面头部 */}
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center mb-4">
                            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
                                <BeakerIcon className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">实验功能</h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            探索最前沿的技术功能，参与产品创新的每一个阶段
                        </p>
                    </div>

                    {/* 警告提示 */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                        <div className="flex items-start">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-medium text-yellow-800 mb-1">实验性功能说明</h3>
                                <p className="text-sm text-yellow-700">
                                    这里的功能正在开发和测试中，可能存在不稳定性。您的反馈对我们非常重要，请积极参与并分享您的使用体验。
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 快速导航 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <Link
                            href="/dashboard/analytics"
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                        >
                            <RocketLaunchIcon className="h-8 w-8 text-blue-600 mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">性能测试</h3>
                            <p className="text-gray-600 text-sm">运行系统性能测试和基准测试</p>
                        </Link>

                        <Link
                            href="/chat"
                            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 hover:from-green-100 hover:to-emerald-100 transition-colors"
                        >
                            <SparklesIcon className="h-8 w-8 text-green-600 mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI 对话</h3>
                            <p className="text-gray-600 text-sm">体验最新的AI模型和对话功能</p>
                        </Link>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                            <LightBulbIcon className="h-8 w-8 text-purple-600 mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">反馈建议</h3>
                            <p className="text-gray-600 text-sm">分享您的想法和改进建议</p>
                        </div>
                    </div>

                    {/* 实验项目列表 */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-8">当前实验项目</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {experiments.map((experiment) => (
                                <ExperimentCard key={experiment.id} experiment={experiment} />
                            ))}
                        </div>
                    </div>

                    {/* 参与指南 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">如何参与</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-xl font-bold text-blue-600">1</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">选择实验</h3>
                                <p className="text-gray-600">浏览可用的实验项目，选择感兴趣的功能</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-xl font-bold text-green-600">2</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">开始体验</h3>
                                <p className="text-gray-600">按照指引使用实验功能，记录使用体验</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-xl font-bold text-purple-600">3</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">提供反馈</h3>
                                <p className="text-gray-600">分享您的使用感受和改进建议</p>
                            </div>
                        </div>
                    </div>
                </div>
            </MainLayout>
        </div>
    );
} 
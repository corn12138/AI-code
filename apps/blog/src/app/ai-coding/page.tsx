'use client';

import {
    BeakerIcon,
    ChartBarIcon,
    ChatBubbleLeftIcon,
    CodeBracketIcon,
    LightBulbIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import MainLayout from '../../components/layout/MainLayout';
import TopNavbar from '../../components/layout/TopNavbar';

export default function AICodingPage() {
    const features = [
        {
            title: 'AI 聊天助手',
            description: '与多种AI模型对话，获得编程帮助和技术建议',
            icon: ChatBubbleLeftIcon,
            href: '/chat',
            status: 'available',
            badge: '多模型支持'
        },
        {
            title: '智能代码生成',
            description: '基于自然语言描述生成高质量代码',
            icon: CodeBracketIcon,
            href: '/ai-coding/generator',
            status: 'coming-soon',
            badge: '即将推出'
        },
        {
            title: '代码审查助手',
            description: 'AI驱动的代码质量检查和优化建议',
            icon: LightBulbIcon,
            href: '/ai-coding/review',
            status: 'coming-soon',
            badge: '开发中'
        },
        {
            title: 'AI 性能分析',
            description: '智能分析代码性能瓶颈并提供优化方案',
            icon: ChartBarIcon,
            href: '/dashboard/analytics',
            status: 'available',
            badge: '数据分析'
        },
        {
            title: '实验功能',
            description: '体验最新的AI编程实验性功能',
            icon: BeakerIcon,
            href: '/labs',
            status: 'beta',
            badge: 'Beta'
        },
        {
            title: '智能文档生成',
            description: '自动生成API文档和代码注释',
            icon: SparklesIcon,
            href: '/ai-coding/docs',
            status: 'coming-soon',
            badge: '规划中'
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'beta':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'coming-soon':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const FeatureCard = ({ feature }: { feature: typeof features[0] }) => (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="p-3 bg-blue-50 rounded-lg mr-4">
                        <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(feature.status)}`}>
                            {feature.badge}
                        </span>
                    </div>
                </div>
            </div>

            <p className="text-gray-600 mb-4 line-height-relaxed">
                {feature.description}
            </p>

            {feature.status === 'available' ? (
                <Link
                    href={feature.href}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                    立即体验
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            ) : feature.status === 'beta' ? (
                <Link
                    href={feature.href}
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors"
                >
                    Beta 体验
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            ) : (
                <button
                    disabled
                    className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-md cursor-not-allowed"
                >
                    敬请期待
                </button>
            )}
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
                            <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
                                <SparklesIcon className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Coding</h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            让AI成为你的编程伙伴，提升开发效率，探索编程的无限可能
                        </p>
                        <div className="mt-6">
                            <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full border border-red-200">
                                🔥 NEW
                            </span>
                        </div>
                    </div>

                    {/* 快速开始 */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-12">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">快速开始</h2>
                            <p className="text-gray-600 mb-6">选择一个功能开始你的AI编程之旅</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/chat"
                                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                                    开始AI对话
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                                >
                                    <ChartBarIcon className="h-5 w-5 mr-2" />
                                    查看数据分析
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 功能列表 */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">核心功能</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => (
                                <FeatureCard key={index} feature={feature} />
                            ))}
                        </div>
                    </div>

                    {/* 技术特色 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">技术特色</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <SparklesIcon className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">多模型支持</h3>
                                <p className="text-gray-600">支持 Qwen2.5、Gemma-3 等多种先进AI模型</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ChartBarIcon className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">实时监控</h3>
                                <p className="text-gray-600">实时监控AI使用情况和性能指标</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BeakerIcon className="h-8 w-8 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">持续创新</h3>
                                <p className="text-gray-600">不断探索和集成最新的AI编程技术</p>
                            </div>
                        </div>
                    </div>
                </div>
            </MainLayout>
        </div>
    );
} 
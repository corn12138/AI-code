'use client';

import ClientPageWrapper from '@/components/ClientPageWrapper';
import Link from 'next/link';

interface DocCategory {
    id: string;
    name: string;
    description: string;
    docs: DocItem[];
}

interface DocItem {
    id: string;
    title: string;
    description: string;
    link: string;
    isExternal?: boolean;
}

export default function DocsPage() {
    const docCategories: DocCategory[] = [
        {
            id: 'getting-started',
            name: '快速开始',
            description: '了解如何快速上手使用我们的平台',
            docs: [
                {
                    id: 'installation',
                    title: '安装指南',
                    description: '如何安装和设置开发环境',
                    link: '/docs/installation'
                },
                {
                    id: 'quick-start',
                    title: '快速入门',
                    description: '10分钟快速了解核心功能',
                    link: '/docs/quick-start'
                },
                {
                    id: 'configuration',
                    title: '配置说明',
                    description: '系统配置和自定义选项',
                    link: '/docs/configuration'
                }
            ]
        },
        {
            id: 'api',
            name: 'API 文档',
            description: '完整的 API 接口文档和示例',
            docs: [
                {
                    id: 'auth-api',
                    title: '认证 API',
                    description: '用户认证和授权相关接口',
                    link: '/docs/api/auth'
                },
                {
                    id: 'articles-api',
                    title: '文章 API',
                    description: '文章增删改查和管理接口',
                    link: '/docs/api/articles'
                },
                {
                    id: 'users-api',
                    title: '用户 API',
                    description: '用户管理和信息获取接口',
                    link: '/docs/api/users'
                }
            ]
        },
        {
            id: 'lowcode',
            name: '低代码平台',
            description: '低代码页面构建器使用指南',
            docs: [
                {
                    id: 'page-builder',
                    title: '页面构建器',
                    description: '如何使用可视化页面构建器',
                    link: '/docs/lowcode/page-builder'
                },
                {
                    id: 'components',
                    title: '组件库',
                    description: '可用组件和配置说明',
                    link: '/docs/lowcode/components'
                },
                {
                    id: 'deployment',
                    title: '页面发布',
                    description: '如何发布和管理页面',
                    link: '/docs/lowcode/deployment'
                }
            ]
        },
        {
            id: 'guides',
            name: '使用指南',
            description: '详细的功能使用教程',
            docs: [
                {
                    id: 'writing-articles',
                    title: '撰写文章',
                    description: '如何创建和编辑优质文章',
                    link: '/docs/guides/writing'
                },
                {
                    id: 'managing-content',
                    title: '内容管理',
                    description: '分类、标签和内容组织',
                    link: '/docs/guides/content-management'
                },
                {
                    id: 'user-management',
                    title: '用户管理',
                    description: '用户权限和角色管理',
                    link: '/docs/guides/user-management'
                }
            ]
        },
        {
            id: 'external',
            name: '外部资源',
            description: '相关技术文档和资源链接',
            docs: [
                {
                    id: 'swagger',
                    title: 'Swagger API 文档',
                    description: '在线 API 接口文档',
                    link: 'http://localhost:3001/api/docs',
                    isExternal: true
                },
                {
                    id: 'github',
                    title: 'GitHub 仓库',
                    description: '项目源码和问题反馈',
                    link: 'https://github.com/your-repo',
                    isExternal: true
                },
                {
                    id: 'changelog',
                    title: '更新日志',
                    description: '版本更新和新功能发布记录',
                    link: '/docs/changelog'
                }
            ]
        }
    ];

    return (
        <ClientPageWrapper>
            <div className="container mx-auto px-4 py-8">
                {/* 页面头部 */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        文档中心
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        这里有完整的使用指南、API 文档和最佳实践，帮助您快速上手并充分利用我们的平台。
                    </p>
                </div>

                {/* 搜索框 */}
                <div className="max-w-md mx-auto mb-12">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="搜索文档..."
                        />
                    </div>
                </div>

                {/* 文档分类 */}
                <div className="space-y-12">
                    {docCategories.map((category) => (
                        <div key={category.id} className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                    {category.name}
                                </h2>
                                <p className="text-gray-600">{category.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {category.docs.map((doc) => (
                                    <div key={doc.id} className="group">
                                        {doc.isExternal ? (
                                            <a
                                                href={doc.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all group-hover:bg-gray-50"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                                                            {doc.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {doc.description}
                                                        </p>
                                                    </div>
                                                    <svg className="h-4 w-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </div>
                                            </a>
                                        ) : (
                                            <Link
                                                href={doc.link}
                                                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all group-hover:bg-gray-50"
                                            >
                                                <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                                                    {doc.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {doc.description}
                                                </p>
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 帮助信息 */}
                <div className="mt-12 bg-primary-50 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-primary-900 mb-2">
                        需要更多帮助？
                    </h3>
                    <p className="text-primary-700 mb-4">
                        如果您在文档中没有找到需要的信息，请随时联系我们的支持团队。
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/contact"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                        >
                            联系支持
                        </Link>
                        <Link
                            href="/community"
                            className="inline-flex items-center px-4 py-2 border border-primary-300 text-sm font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 transition-colors"
                        >
                            社区讨论
                        </Link>
                    </div>
                </div>
            </div>
        </ClientPageWrapper>
    );
}

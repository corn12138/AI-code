'use client';

import { useAuth } from '@corn12138/hooks';
import {
    AcademicCapIcon,
    BeakerIcon,
    BookOpenIcon,
    ChartBarIcon,
    ChatBubbleLeftIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    FireIcon,
    HeartIcon,
    HomeIcon,
    LightBulbIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TagIcon,
    UserGroupIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
    showSidebar?: boolean;
    showRightSidebar?: boolean;
}

export default function MainLayout({
    children,
    showSidebar = true,
    showRightSidebar = true
}: MainLayoutProps) {
    const { isAuthenticated, user } = useAuth();
    const pathname = usePathname();
    const [selectedCategory, setSelectedCategory] = useState('最新');

    // 公开导航项（未登录时也显示）
    const publicNavItems = [
        { name: '最新', icon: HomeIcon, href: '/', current: pathname === '/' },
        { name: '热门', icon: FireIcon, href: '/hot', current: pathname === '/hot' },
        { name: '文章', icon: DocumentTextIcon, href: '/blog', current: pathname.startsWith('/blog') },
        { name: '标签', icon: TagIcon, href: '/tags', current: pathname.startsWith('/tags') },
        { name: '搜索', icon: MagnifyingGlassIcon, href: '/search', current: pathname === '/search' },
    ];

    // 登录后显示的导航项
    const authenticatedNavItems = [
        { name: '关注', icon: HeartIcon, href: '/following', current: pathname === '/following' },
        { name: 'AI 助手', icon: ChatBubbleLeftIcon, href: '/chat', current: pathname === '/chat' },
        { name: '写文章', icon: PencilSquareIcon, href: '/editor', current: pathname.startsWith('/editor') },
    ];

    // 我的空间（登录后显示）
    const mySpaceItems = [
        { name: '仪表板', icon: ChartBarIcon, href: '/dashboard', current: pathname.startsWith('/dashboard') },
        { name: '我的文章', icon: DocumentTextIcon, href: '/dashboard/articles', current: pathname === '/dashboard/articles' },
        { name: '草稿管理', icon: BookOpenIcon, href: '/dashboard/drafts', current: pathname === '/dashboard/drafts' },
        { name: '数据分析', icon: ChartBarIcon, href: '/dashboard/analytics', current: pathname === '/dashboard/analytics' },
        { name: '个人资料', icon: UserIcon, href: '/profile', current: pathname === '/profile' },
    ];

    // 开发者工具（登录后显示）
    const developerItems = [
        { name: '文档中心', icon: AcademicCapIcon, href: '/docs', current: pathname.startsWith('/docs') },
        { name: '话题讨论', icon: UserGroupIcon, href: '/topics', current: pathname.startsWith('/topics') },
        { name: '实验功能', icon: BeakerIcon, href: '/labs', current: pathname.startsWith('/labs') },
        { name: '设置', icon: Cog6ToothIcon, href: '/settings', current: pathname.startsWith('/settings') },
    ];

    const NavItem = ({ item, section = '' }: { item: any; section?: string }) => (
        <Link
            href={item.href}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${item.current
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            onClick={() => setSelectedCategory(item.name)}
        >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
        </Link>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-screen-xl mx-auto flex">
                {/* 左侧导航栏 */}
                {showSidebar && (
                    <div className="hidden lg:block w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
                        <div className="sticky top-0 p-6 space-y-6">
                            {/* 公开导航 */}
                            <nav className="space-y-2">
                                {publicNavItems.map((item) => (
                                    <NavItem key={item.name} item={item} />
                                ))}
                            </nav>

                            {/* 登录后的导航 */}
                            {isAuthenticated && (
                                <>
                                    <div className="pt-4 border-t border-gray-200">
                                        <nav className="space-y-2">
                                            {authenticatedNavItems.map((item) => (
                                                <NavItem key={item.name} item={item} />
                                            ))}
                                        </nav>
                                    </div>

                                    {/* 我的空间 */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                            我的空间
                                        </h3>
                                        <nav className="space-y-2">
                                            {mySpaceItems.map((item) => (
                                                <NavItem key={item.name} item={item} section="myspace" />
                                            ))}
                                        </nav>
                                    </div>

                                    {/* 开发者工具 */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                            开发者工具
                                        </h3>
                                        <nav className="space-y-2">
                                            {developerItems.map((item) => (
                                                <NavItem key={item.name} item={item} section="developer" />
                                            ))}
                                        </nav>
                                    </div>
                                </>
                            )}

                            {/* 未登录提示 */}
                            {!isAuthenticated && (
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <LightBulbIcon className="h-8 w-8 text-blue-600 mr-3" />
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">
                                                    发现更多功能
                                                </h3>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    登录后解锁AI助手、个人仪表板等功能
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 space-y-2">
                                            <Link
                                                href="/login"
                                                className="block w-full text-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                                立即登录
                                            </Link>
                                            <Link
                                                href="/register"
                                                className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                                            >
                                                注册账号
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 主内容区域 */}
                <div className={`flex-1 ${showSidebar ? 'lg:ml-0' : ''} ${showRightSidebar ? 'lg:mr-0' : ''}`}>
                    <main className="bg-white min-h-screen">
                        {children}
                    </main>
                </div>

                {/* 右侧边栏 */}
                {showRightSidebar && (
                    <div className="hidden xl:block w-80 bg-white border-l border-gray-200 min-h-screen">
                        <div className="sticky top-0 p-6 space-y-6">
                            {/* 用户信息卡片 */}
                            {isAuthenticated && user && (
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                            {(user as any).username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {(user as any).username}
                                            </h3>
                                            <p className="text-xs text-gray-600">
                                                {(user as any).email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                                        <div>
                                            <div className="text-lg font-semibold text-gray-900">1</div>
                                            <div className="text-xs text-gray-600">获赞</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-semibold text-gray-900">2</div>
                                            <div className="text-xs text-gray-600">文章</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-semibold text-gray-900">5</div>
                                            <div className="text-xs text-gray-600">关注</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-semibold text-gray-900">11</div>
                                            <div className="text-xs text-gray-600">关注者</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 精选沸点 */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">精选沸点</h3>
                                <div className="space-y-3">
                                    {[
                                        { title: '92年，33岁女，谈情期间被辞退分手，最近看天朝精神保险，心', time: '42分钟' },
                                        { title: '没想到公司高层这么善意的事也能处理得如此不堪，防火', time: '20分钟' },
                                        { title: '因为小伙子被宜家行程辞退，盘点目前违背心得。。。', time: '55分钟' }
                                    ].map((item, index) => (
                                        <div key={index} className="border-l-2 border-blue-100 pl-3">
                                            <p className="text-sm text-gray-700 line-clamp-2 mb-1">{item.title}</p>
                                            <p className="text-xs text-gray-500">{item.time} · 647评论</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 推荐话题 */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">推荐话题</h3>
                                    <button className="text-sm text-blue-600 hover:text-blue-700">换一换</button>
                                </div>
                                <div className="space-y-2">
                                    {[
                                        { tag: '#我每周日一条沸点#', count: '18.5m' },
                                        { tag: '#Trae都失心疯了?#', count: '48k' },
                                        { tag: '#每日快讯#', count: '37m' },
                                        { tag: '#MCP 怎么玩#', count: '430k' },
                                        { tag: '#金石庐条新#', count: '2.5m' }
                                    ].map((topic, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                                                {topic.tag}
                                            </span>
                                            <span className="text-xs text-gray-500">{topic.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 快捷操作 */}
                            {isAuthenticated && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">快捷操作</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link
                                            href="/editor"
                                            className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            <PencilSquareIcon className="h-4 w-4 mr-1" />
                                            写文章
                                        </Link>
                                        <Link
                                            href="/chat"
                                            className="flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                                        >
                                            <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                                            AI助手
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 
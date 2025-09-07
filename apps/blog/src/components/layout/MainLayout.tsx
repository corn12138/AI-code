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
import { StarryBackground, StarryParticles } from '../ui/StarryBackground';

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
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
            className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-out touch-target group ${item.current
                ? 'bg-gradient-to-r from-cosmic-600/20 to-nebula-600/20 text-cosmic-300 border border-cosmic-500/30 shadow-cosmic backdrop-blur-sm'
                : 'text-space-300 hover:text-cosmic-300 hover:bg-space-800/50 hover:border hover:border-cosmic-500/20 backdrop-blur-sm'
                }`}
            onClick={() => {
                setSelectedCategory(item.name);
                setIsMobileSidebarOpen(false);
            }}
        >
            <item.icon className={`mr-3 h-5 w-5 transition-all duration-300 ${item.current ? 'text-cosmic-400' : 'text-space-400 group-hover:text-cosmic-400'
                }`} />
            {item.name}
        </Link>
    );

    return (
        <StarryBackground>
            <StarryParticles />

            {/* 移动端侧边栏背景遮罩 */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            <div className="max-w-screen-xl mx-auto flex">
                {/* 移动端侧边栏按钮 */}
                {showSidebar && (
                    <button
                        className="fixed top-4 left-4 z-50 lg:hidden bg-space-800/80 backdrop-blur-md rounded-xl p-3 shadow-space-glow border border-cosmic-500/30 touch-target transition-all duration-300 hover:bg-space-700/80 hover:shadow-cosmic"
                        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    >
                        {isMobileSidebarOpen ? (
                            <svg className="h-5 w-5 text-cosmic-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5 text-cosmic-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                )}

                {/* 左侧导航栏 */}
                {showSidebar && (
                    <div className={`
                        fixed lg:relative lg:block w-72 bg-space-900/80 backdrop-blur-xl border-r border-cosmic-500/20 min-h-screen z-40
                        transition-all duration-500 ease-out
                        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}>
                        <div className="sticky top-0 p-6 space-y-6 pt-20 lg:pt-6">
                            {/* Logo区域 */}
                            <div className="mb-8">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-cosmic-500 to-nebula-500 rounded-xl flex items-center justify-center shadow-cosmic">
                                        <span className="text-white font-bold text-lg">✨</span>
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold bg-gradient-to-r from-cosmic-300 to-nebula-300 bg-clip-text text-transparent">
                                            Cosmic Blog
                                        </h1>
                                        <p className="text-xs text-space-400">探索技术的无限可能</p>
                                    </div>
                                </div>
                            </div>

                            {/* 公开导航 */}
                            <nav className="space-y-2">
                                {publicNavItems.map((item) => (
                                    <NavItem key={item.name} item={item} />
                                ))}
                            </nav>

                            {/* 登录后的导航 */}
                            {isAuthenticated && (
                                <>
                                    <div className="pt-6 border-t border-space-700/50">
                                        <nav className="space-y-2">
                                            {authenticatedNavItems.map((item) => (
                                                <NavItem key={item.name} item={item} />
                                            ))}
                                        </nav>
                                    </div>

                                    {/* 我的空间 */}
                                    <div className="pt-6 border-t border-space-700/50">
                                        <h3 className="px-4 text-xs font-semibold text-space-400 uppercase tracking-wider mb-3">
                                            我的空间
                                        </h3>
                                        <nav className="space-y-2">
                                            {mySpaceItems.map((item) => (
                                                <NavItem key={item.name} item={item} section="myspace" />
                                            ))}
                                        </nav>
                                    </div>

                                    {/* 开发者工具 */}
                                    <div className="pt-6 border-t border-space-700/50">
                                        <h3 className="px-4 text-xs font-semibold text-space-400 uppercase tracking-wider mb-3">
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
                                <div className="pt-6 border-t border-space-700/50">
                                    <div className="bg-gradient-to-r from-cosmic-600/10 to-nebula-600/10 rounded-xl p-4 border border-cosmic-500/20 backdrop-blur-sm">
                                        <div className="flex items-center">
                                            <LightBulbIcon className="h-8 w-8 text-stardust-400 mr-3" />
                                            <div>
                                                <h3 className="text-sm font-medium text-space-200">
                                                    发现更多功能
                                                </h3>
                                                <p className="text-xs text-space-400 mt-1">
                                                    登录后解锁AI助手、个人仪表板等功能
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 space-y-2">
                                            <Link
                                                href="/login"
                                                className="block w-full text-center px-4 py-2 bg-gradient-to-r from-cosmic-600 to-nebula-600 text-white text-sm font-medium rounded-lg hover:from-cosmic-700 hover:to-nebula-700 transition-all duration-300 shadow-cosmic"
                                            >
                                                立即登录
                                            </Link>
                                            <Link
                                                href="/register"
                                                className="block w-full text-center px-4 py-2 border border-cosmic-500/30 text-space-300 text-sm font-medium rounded-lg hover:bg-space-800/50 transition-all duration-300"
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
                <div className={`flex-1 ${showSidebar ? 'lg:ml-0' : ''} ${showRightSidebar ? 'lg:mr-0' : ''} ${showSidebar ? 'pl-0 lg:pl-0' : ''}`}>
                    <main className="min-h-screen p-4 lg:p-6 animate-fade-in">
                        {children}
                    </main>
                </div>

                {/* 右侧边栏 */}
                {showRightSidebar && (
                    <div className="hidden xl:block w-80 bg-space-900/80 backdrop-blur-xl border-l border-cosmic-500/20 min-h-screen">
                        <div className="sticky top-0 p-6 space-y-6">
                            {/* 用户信息卡片 */}
                            {isAuthenticated && user && (
                                <div className="bg-gradient-to-r from-cosmic-600/10 to-nebula-600/10 rounded-xl p-4 border border-cosmic-500/20 backdrop-blur-sm">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-cosmic-500 to-nebula-600 flex items-center justify-center text-white font-bold text-lg shadow-cosmic">
                                            {(user as any).username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-space-200">
                                                {(user as any).username}
                                            </h3>
                                            <p className="text-xs text-space-400">
                                                {(user as any).email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                                        <div>
                                            <div className="text-lg font-semibold text-cosmic-300">1</div>
                                            <div className="text-xs text-space-400">获赞</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-semibold text-nebula-300">2</div>
                                            <div className="text-xs text-space-400">文章</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-semibold text-stardust-300">5</div>
                                            <div className="text-xs text-space-400">关注</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-semibold text-cosmic-300">11</div>
                                            <div className="text-xs text-space-400">关注者</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 精选沸点 */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-space-200">精选沸点</h3>
                                <div className="space-y-3">
                                    {[
                                        { title: '92年，33岁女，谈情期间被辞退分手，最近看天朝精神保险，心', time: '42分钟' },
                                        { title: '没想到公司高层这么善意的事也能处理得如此不堪，防火', time: '20分钟' },
                                        { title: '因为小伙子被宜家行程辞退，盘点目前违背心得。。。', time: '55分钟' }
                                    ].map((item, index) => (
                                        <div key={index} className="border-l-2 border-cosmic-500/50 pl-3 hover:border-cosmic-400 transition-colors duration-300">
                                            <p className="text-sm text-space-300 line-clamp-2 mb-1">{item.title}</p>
                                            <p className="text-xs text-space-500">{item.time} · 647评论</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 推荐话题 */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-space-200">推荐话题</h3>
                                    <button className="text-sm text-cosmic-400 hover:text-cosmic-300 transition-colors duration-300">换一换</button>
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
                                            <span className="text-sm text-cosmic-400 hover:text-cosmic-300 cursor-pointer transition-colors duration-300">
                                                {topic.tag}
                                            </span>
                                            <span className="text-xs text-space-500">{topic.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 快捷操作 */}
                            {isAuthenticated && (
                                <div className="bg-space-800/50 rounded-xl p-4 border border-space-700/30 backdrop-blur-sm">
                                    <h3 className="text-sm font-medium text-space-200 mb-3">快捷操作</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link
                                            href="/editor"
                                            className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-cosmic-600 to-nebula-600 text-white text-sm rounded-lg hover:from-cosmic-700 hover:to-nebula-700 transition-all duration-300 shadow-cosmic"
                                        >
                                            <PencilSquareIcon className="h-4 w-4 mr-1" />
                                            写文章
                                        </Link>
                                        <Link
                                            href="/chat"
                                            className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-stardust-600 to-stardust-700 text-white text-sm rounded-lg hover:from-stardust-700 hover:to-stardust-800 transition-all duration-300 shadow-stardust"
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
        </StarryBackground>
    );
} 
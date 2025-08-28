'use client';

import {
    useAuthSecure,
    useFormEnhanced,
    usePageState,
    useSmoothRouter,
    useUIInteraction,
} from '@corn12138/hooks';
import {
    AcademicCapIcon,
    Bars3Icon,
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
    XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface MainLayoutEnhancedProps {
    children: React.ReactNode;
    showSidebar?: boolean;
    showRightSidebar?: boolean;
}

interface NavItem {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    current: boolean;
    badge?: string;
    requiresAuth?: boolean;
}

export default function MainLayoutEnhanced({
    children,
    showSidebar = true,
    showRightSidebar = true
}: MainLayoutEnhancedProps) {
    const { isAuthenticated, user, loading: authLoading } = useAuthSecure();
    const pathname = usePathname();
    const { push, preload, isNavigating } = useSmoothRouter();
    const { saveCustomData, getCustomData } = usePageState();
    const {
        ripple,
        hapticFeedback,
        smoothScrollTo,
        isReducedMotion,
        isTouchDevice,
    } = useUIInteraction();

    // 侧边栏状态管理
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
        // 从页面状态恢复折叠状态
        return getCustomData('sidebarCollapsed') || {};
    });

    // 快速搜索表单
    const searchForm = useFormEnhanced({
        query: {
            defaultValue: '',
            validation: { minLength: 1 },
            debounceMs: 300,
            validateOnChange: true,
        },
        $form: {
            onSubmit: async (data) => {
                if (data.query.trim()) {
                    await push(`/search?q=${encodeURIComponent(data.query.trim())}`);
                    searchForm.reset();
                }
            },
        },
    }, 'quickSearch');

    // 导航项配置
    const publicNavItems: NavItem[] = [
        { name: '首页', icon: HomeIcon, href: '/', current: pathname === '/' },
        { name: '热门', icon: FireIcon, href: '/hot', current: pathname === '/hot' },
        { name: '文章', icon: DocumentTextIcon, href: '/blog', current: pathname.startsWith('/blog') },
        { name: '标签', icon: TagIcon, href: '/tags', current: pathname.startsWith('/tags') },
        { name: '搜索', icon: MagnifyingGlassIcon, href: '/search', current: pathname === '/search' },
    ];

    const authenticatedNavItems: NavItem[] = [
        {
            name: '关注',
            icon: HeartIcon,
            href: '/following',
            current: pathname === '/following',
            requiresAuth: true,
        },
        {
            name: 'AI 助手',
            icon: ChatBubbleLeftIcon,
            href: '/chat',
            current: pathname === '/chat',
            badge: 'AI',
            requiresAuth: true,
        },
        {
            name: '写文章',
            icon: PencilSquareIcon,
            href: '/editor',
            current: pathname.startsWith('/editor'),
            requiresAuth: true,
        },
    ];

    const mySpaceItems: NavItem[] = [
        {
            name: '仪表板',
            icon: ChartBarIcon,
            href: '/dashboard',
            current: pathname.startsWith('/dashboard'),
            requiresAuth: true,
        },
        {
            name: '我的文章',
            icon: DocumentTextIcon,
            href: '/dashboard/articles',
            current: pathname === '/dashboard/articles',
            requiresAuth: true,
        },
        {
            name: '草稿管理',
            icon: BookOpenIcon,
            href: '/dashboard/drafts',
            current: pathname === '/dashboard/drafts',
            requiresAuth: true,
        },
        {
            name: '数据分析',
            icon: ChartBarIcon,
            href: '/dashboard/analytics',
            current: pathname === '/dashboard/analytics',
            requiresAuth: true,
        },
        {
            name: '个人资料',
            icon: UserIcon,
            href: '/profile',
            current: pathname === '/profile',
            requiresAuth: true,
        },
    ];

    const developerItems: NavItem[] = [
        {
            name: '文档中心',
            icon: AcademicCapIcon,
            href: '/docs',
            current: pathname.startsWith('/docs'),
        },
        {
            name: '话题讨论',
            icon: UserGroupIcon,
            href: '/topics',
            current: pathname.startsWith('/topics'),
        },
        {
            name: '实验功能',
            icon: BeakerIcon,
            href: '/labs',
            current: pathname.startsWith('/labs'),
            badge: 'Beta',
        },
        {
            name: '设置',
            icon: Cog6ToothIcon,
            href: '/settings',
            current: pathname.startsWith('/settings'),
            requiresAuth: true,
        },
    ];

    // 处理导航项点击
    const handleNavClick = useCallback(async (item: NavItem, event: React.MouseEvent) => {
        if (!isReducedMotion) {
            const target = event.currentTarget as HTMLElement;
            ripple(target, event);
        }

        if (isTouchDevice) {
            hapticFeedback('light');
        }

        if (item.requiresAuth && !isAuthenticated) {
            toast.error('请先登录');
            await push('/login');
            return;
        }

        setIsMobileSidebarOpen(false);
        await push(item.href);
    }, [isReducedMotion, isTouchDevice, isAuthenticated, ripple, hapticFeedback, push]);

    // 处理链接预加载
    const handleLinkHover = useCallback((href: string) => {
        preload(href);
    }, [preload]);

    // 切换侧边栏分组
    const toggleSection = useCallback((sectionKey: string) => {
        const newCollapsedState = {
            ...collapsedSections,
            [sectionKey]: !collapsedSections[sectionKey],
        };
        setCollapsedSections(newCollapsedState);
        saveCustomData('sidebarCollapsed', newCollapsedState);
    }, [collapsedSections, saveCustomData]);

    // 导航项组件
    const NavItem: React.FC<{
        item: NavItem;
        section?: string;
        onClick?: (item: NavItem, event: React.MouseEvent) => void;
    }> = ({ item, section = '', onClick }) => (
        <Link
            href={item.href}
            onMouseEnter={() => handleLinkHover(item.href)}
            className={`
                group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium 
                transition-all duration-200 relative overflow-hidden
                ${item.current
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
                ${item.requiresAuth && !isAuthenticated ? 'opacity-60' : ''}
                touch-manipulation
            `}
            onClick={(e) => {
                e.preventDefault();
                onClick?.(item, e) || handleNavClick(item, e);
            }}
        >
            <item.icon className={`
                mr-3 h-5 w-5 transition-colors duration-200
                ${item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
            `} />
            <span className="flex-1">{item.name}</span>
            {item.badge && (
                <span className={`
                    ml-2 px-2 py-0.5 text-xs font-medium rounded-full
                    ${item.badge === 'AI'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }
                `}>
                    {item.badge}
                </span>
            )}
        </Link>
    );

    // 可折叠导航分组组件
    const CollapsibleNavSection: React.FC<{
        title: string;
        sectionKey: string;
        items: NavItem[];
        children?: React.ReactNode;
    }> = ({ title, sectionKey, items, children }) => {
        const isCollapsed = collapsedSections[sectionKey];

        return (
            <div className="pt-4 border-t border-gray-200">
                <button
                    onClick={() => toggleSection(sectionKey)}
                    className="w-full flex items-center justify-between px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 hover:text-gray-700 transition-colors"
                >
                    <span>{title}</span>
                    <svg
                        className={`h-3 w-3 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </button>
                <div className={`
                    transition-all duration-300 ease-in-out overflow-hidden
                    ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'}
                `}>
                    <nav className="space-y-2">
                        {items.map((item) => (
                            <NavItem key={item.name} item={item} section={sectionKey} />
                        ))}
                    </nav>
                    {children}
                </div>
            </div>
        );
    };

    // 快速搜索组件
    const QuickSearch: React.FC = () => (
        <div className="mb-4">
            <form {...searchForm.getFormProps()} className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    {...searchForm.getFieldProps('query')}
                    type="text"
                    placeholder="快速搜索..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {searchForm.getFieldState('query').value && (
                    <button
                        type="button"
                        onClick={() => searchForm.setFieldValue('query', '')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                )}
            </form>
        </div>
    );

    // 移动端侧边栏切换按钮
    const MobileSidebarToggle: React.FC = () => (
        <button
            className="fixed top-4 left-4 z-50 lg:hidden bg-white rounded-lg p-2.5 shadow-lg border border-gray-200 touch-manipulation"
            onClick={(e) => {
                if (!isReducedMotion) {
                    ripple(e.currentTarget, e);
                }
                if (isTouchDevice) {
                    hapticFeedback('light');
                }
                setIsMobileSidebarOpen(!isMobileSidebarOpen);
            }}
        >
            {isMobileSidebarOpen ? (
                <XMarkIcon className="h-5 w-5 text-gray-600" />
            ) : (
                <Bars3Icon className="h-5 w-5 text-gray-600" />
            )}
        </button>
    );

    // 保存侧边栏状态到页面状态
    useEffect(() => {
        saveCustomData('sidebarState', {
            isMobileSidebarOpen,
            collapsedSections,
        });
    }, [isMobileSidebarOpen, collapsedSections, saveCustomData]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 移动端侧边栏遮罩 */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            <div className="max-w-screen-xl mx-auto flex">
                {/* 移动端侧边栏切换按钮 */}
                {showSidebar && <MobileSidebarToggle />}

                {/* 左侧导航栏 */}
                {showSidebar && (
                    <div className={`
                        fixed lg:relative lg:block w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen z-40
                        transition-transform duration-300 ease-in-out
                        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}>
                        <div className="sticky top-0 p-4 lg:p-6 space-y-4 pt-16 lg:pt-6 max-h-screen overflow-y-auto">
                            {/* 快速搜索 */}
                            <QuickSearch />

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
                                    <CollapsibleNavSection
                                        title="我的空间"
                                        sectionKey="mySpace"
                                        items={mySpaceItems}
                                    />

                                    {/* 开发者工具 */}
                                    <CollapsibleNavSection
                                        title="开发者工具"
                                        sectionKey="developer"
                                        items={developerItems}
                                    />
                                </>
                            )}

                            {/* 未登录提示 */}
                            {!isAuthenticated && !authLoading.isLoading && (
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                                        <div className="flex items-start">
                                            <LightBulbIcon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                                    发现更多功能
                                                </h3>
                                                <p className="text-xs text-gray-600 mb-3">
                                                    登录后解锁AI助手、个人仪表板等功能
                                                </p>
                                                <div className="space-y-2">
                                                    <Link
                                                        href="/login"
                                                        onMouseEnter={() => handleLinkHover('/login')}
                                                        className="block w-full text-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        立即登录
                                                    </Link>
                                                    <Link
                                                        href="/register"
                                                        onMouseEnter={() => handleLinkHover('/register')}
                                                        className="block w-full text-center px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        注册账号
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 主内容区域 */}
                <div className={`
                    flex-1 
                    ${showSidebar ? 'lg:ml-0' : ''} 
                    ${showRightSidebar ? 'lg:mr-0' : ''} 
                    ${showSidebar ? 'pl-0 lg:pl-0' : ''}
                    ${isNavigating ? 'pointer-events-none' : ''}
                `}>
                    <main className="bg-white min-h-screen mobile-padding pt-16 lg:pt-4">
                        {children}
                    </main>
                </div>

                {/* 右侧边栏 */}
                {showRightSidebar && (
                    <div className="hidden xl:block w-80 bg-white border-l border-gray-200 min-h-screen">
                        <div className="sticky top-0 p-6 space-y-6 max-h-screen overflow-y-auto">
                            {/* 用户信息卡片 */}
                            {isAuthenticated && user && (
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                            {user.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                {user.username}
                                            </h3>
                                            <p className="text-xs text-gray-600">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                                        <div className="cursor-pointer hover:bg-white rounded-lg p-2 transition-colors">
                                            <div className="text-lg font-bold text-gray-900">12</div>
                                            <div className="text-xs text-gray-600">获赞</div>
                                        </div>
                                        <div className="cursor-pointer hover:bg-white rounded-lg p-2 transition-colors">
                                            <div className="text-lg font-bold text-gray-900">8</div>
                                            <div className="text-xs text-gray-600">文章</div>
                                        </div>
                                        <div className="cursor-pointer hover:bg-white rounded-lg p-2 transition-colors">
                                            <div className="text-lg font-bold text-gray-900">23</div>
                                            <div className="text-xs text-gray-600">关注</div>
                                        </div>
                                        <div className="cursor-pointer hover:bg-white rounded-lg p-2 transition-colors">
                                            <div className="text-lg font-bold text-gray-900">156</div>
                                            <div className="text-xs text-gray-600">粉丝</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 其他右侧栏内容保持原样... */}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

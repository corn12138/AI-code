'use client';

import { useAuth } from '@corn12138/hooks';
import {
    BookOpenIcon,
    ChartBarIcon,
    ChatBubbleLeftIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    HeartIcon,
    LightBulbIcon,
    PencilSquareIcon,
    UserGroupIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * 交互式侧边栏内容 - 客户端组件
 * 
 * 依赖于用户认证状态的导航项
 * 只在需要时使用客户端渲染
 */

const authenticatedNavItems = [
    { name: '关注', icon: HeartIcon, href: '/following' },
    { name: 'AI 助手', icon: ChatBubbleLeftIcon, href: '/chat' },
    { name: '写文章', icon: PencilSquareIcon, href: '/editor' },
];

const mySpaceItems = [
    { name: '仪表板', icon: ChartBarIcon, href: '/dashboard' },
    { name: '我的文章', icon: DocumentTextIcon, href: '/dashboard/articles' },
    { name: '草稿管理', icon: BookOpenIcon, href: '/dashboard/drafts' },
    { name: '数据分析', icon: ChartBarIcon, href: '/dashboard/analytics' },
    { name: '个人资料', icon: UserIcon, href: '/profile' },
];

const settingsItems = [
    { name: '话题讨论', icon: UserGroupIcon, href: '/topics' },
    { name: '设置', icon: Cog6ToothIcon, href: '/settings' },
];

export function InteractiveSidebarContent() {
    const { isAuthenticated } = useAuth();
    const pathname = usePathname();

    const NavItem = ({ item }: { item: any }) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

        return (
            <Link
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
            >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
            </Link>
        );
    };

    if (!isAuthenticated) {
        return (
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
        );
    }

    return (
        <>
            {/* 登录后的导航 */}
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
                        <NavItem key={item.name} item={item} />
                    ))}
                </nav>
            </div>

            {/* 其他设置 */}
            <div className="pt-4 border-t border-gray-200">
                <nav className="space-y-2">
                    {settingsItems.map((item) => (
                        <NavItem key={item.name} item={item} />
                    ))}
                </nav>
            </div>
        </>
    );
}

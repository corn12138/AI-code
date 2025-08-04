'use client';

import { useAuth } from '@corn12138/hooks';
import {
    ChartBarIcon,
    ChatBubbleLeftRightIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    HomeIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user } = useAuth();
    const pathname = usePathname();

    const navigation = [
        { name: '首页', href: '/', icon: HomeIcon },
        { name: '仪表板', href: '/dashboard', icon: ChartBarIcon },
        { name: '文章管理', href: '/dashboard/articles', icon: DocumentTextIcon },
        { name: '草稿管理', href: '/dashboard/drafts', icon: DocumentTextIcon },
        { name: 'AI对话', href: '/chat', icon: ChatBubbleLeftRightIcon },
        { name: '个人资料', href: '/profile', icon: UserIcon },
        { name: '设置', href: '/dashboard/settings', icon: Cog6ToothIcon },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                {/* 侧边栏 */}
                <div className="hidden md:flex md:flex-shrink-0">
                    <div className="flex flex-col w-64">
                        <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
                            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                                <div className="flex items-center flex-shrink-0 px-4">
                                    <h1 className="text-xl font-bold text-gray-900">TechBlog</h1>
                                </div>
                                <nav className="mt-5 flex-1 px-2 space-y-1">
                                    {navigation.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`${isActive
                                                    ? 'bg-blue-50 border-blue-500 text-blue-700 border-r-2'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
                                            >
                                                <item.icon
                                                    className={`${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                                        } mr-3 flex-shrink-0 h-6 w-6`}
                                                    aria-hidden="true"
                                                />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>

                            {/* 用户信息 */}
                            {user && (
                                <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <img
                                                className="h-8 w-8 rounded-full"
                                                src={(user as any).avatar || '/default-avatar.svg'}
                                                alt=""
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-700">{(user as any).username}</p>
                                            <p className="text-xs text-gray-500">{(user as any).email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 主内容区域 */}
                <div className="flex-1 overflow-hidden">
                    <main className="flex-1 relative overflow-y-auto focus:outline-none">
                        <div className="py-6">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
} 
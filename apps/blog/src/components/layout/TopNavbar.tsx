'use client';

import { useAuth } from '@corn12138/hooks';
import { Menu, Transition } from '@headlessui/react';
import {
    ArrowRightOnRectangleIcon,
    BellIcon,
    Cog6ToothIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { Fragment, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function TopNavbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);

    // 顶部导航tab
    const navTabs = [
        { name: '首页', href: '/', key: 'home' },
        { name: 'AI Coding', href: '/ai-coding', key: 'ai-coding' },
        { name: '沸点', href: '/moments', key: 'moments' },
        { name: '课程', href: '/courses', key: 'courses' },
        { name: '直播', href: '/live', key: 'live' },
        { name: '活动', href: '/events', key: 'events' },
        { name: 'AI问答', href: '/chat', key: 'chat' },
        { name: 'APP', href: '/app', key: 'app' },
        { name: '插件', href: '/plugins', key: 'plugins' },
    ];

    const getActiveTab = () => {
        if (pathname === '/') return 'home';
        if (pathname.startsWith('/chat')) return 'chat';
        if (pathname.startsWith('/ai-coding')) return 'ai-coding';
        if (pathname.startsWith('/moments')) return 'moments';
        if (pathname.startsWith('/courses')) return 'courses';
        if (pathname.startsWith('/live')) return 'live';
        if (pathname.startsWith('/events')) return 'events';
        if (pathname.startsWith('/app')) return 'app';
        if (pathname.startsWith('/plugins')) return 'plugins';
        return 'home';
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleLogout = async () => {
        try {
            await (logout as any)();
            toast.success('已成功退出登录');
            router.push('/');
        } catch (error) {
            console.error('退出登录失败:', error);
            toast.error('退出登录时出现错误');
        }
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* 左侧 Logo 和导航 */}
                    <div className="flex items-center space-x-8">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">AI</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900 hidden sm:block">AI Tech Blog</span>
                        </Link>

                        {/* 导航标签 */}
                        <div className="hidden lg:flex items-center space-x-1">
                            {navTabs.map((tab) => (
                                <Link
                                    key={tab.key}
                                    href={tab.href}
                                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${getActiveTab() === tab.key
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    {tab.name}
                                    {tab.key === 'ai-coding' && (
                                        <span className="ml-1 px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded">
                                            new
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* 右侧 搜索和用户操作 */}
                    <div className="flex items-center space-x-4">
                        {/* 搜索框 */}
                        <form onSubmit={handleSearch} className="relative">
                            <div className={`flex items-center transition-all duration-200 ${searchFocused ? 'w-80' : 'w-64'
                                }`}>
                                <MagnifyingGlassIcon className="absolute left-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="搜索 AI Tech Blog"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-full text-sm focus:outline-none focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                            </div>
                        </form>

                        {isAuthenticated ? (
                            <div className="flex items-center space-x-3">
                                {/* 创作者中心 */}
                                <Menu as="div" className="relative">
                                    <Menu.Button className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        创作者中心
                                        <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </Menu.Button>

                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            <div className="py-1">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            href="/editor"
                                                            className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700`}
                                                        >
                                                            <PlusIcon className="mr-3 h-4 w-4" />
                                                            写文章
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            href="/dashboard"
                                                            className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700`}
                                                        >
                                                            <UserIcon className="mr-3 h-4 w-4" />
                                                            创作者中心
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>

                                {/* 通知 */}
                                <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                                    <BellIcon className="h-6 w-6" />
                                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                                </button>

                                {/* 用户头像菜单 */}
                                <Menu as="div" className="relative">
                                    <Menu.Button className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm">
                                            {(user as any)?.username?.charAt(0).toUpperCase()}
                                        </div>
                                    </Menu.Button>

                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">{(user as any)?.username}</p>
                                                <p className="text-xs text-gray-500">{(user as any)?.email}</p>
                                            </div>
                                            <div className="py-1">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            href="/profile"
                                                            className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700`}
                                                        >
                                                            <UserIcon className="mr-3 h-4 w-4" />
                                                            个人主页
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            href="/dashboard"
                                                            className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm text-gray-700`}
                                                        >
                                                            <Cog6ToothIcon className="mr-3 h-4 w-4" />
                                                            设置
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={handleLogout}
                                                            className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                                                        >
                                                            <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                                                            退出登录
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                                >
                                    登录
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                                >
                                    注册
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
} 
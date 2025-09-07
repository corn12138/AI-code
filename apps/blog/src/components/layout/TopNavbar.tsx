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
        <nav className="bg-space-900/80 backdrop-blur-xl border-b border-cosmic-500/20 sticky top-0 z-50">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* 左侧 Logo 和导航 */}
                    <div className="flex items-center space-x-8">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="w-8 h-8 bg-gradient-to-br from-cosmic-500 to-nebula-600 rounded-lg flex items-center justify-center shadow-cosmic group-hover:shadow-nebula transition-all duration-300">
                                <span className="text-white font-bold text-sm">✨</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-cosmic-300 to-nebula-300 bg-clip-text text-transparent hidden sm:block">
                                Cosmic Blog
                            </span>
                        </Link>

                        {/* 导航标签 */}
                        <div className="hidden lg:flex items-center space-x-1">
                            {navTabs.map((tab) => (
                                <Link
                                    key={tab.key}
                                    href={tab.href}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${getActiveTab() === tab.key
                                        ? 'text-cosmic-300 bg-gradient-to-r from-cosmic-600/20 to-nebula-600/20 shadow-cosmic'
                                        : 'text-space-300 hover:text-cosmic-300 hover:bg-space-800/50'
                                        }`}
                                >
                                    {tab.name}
                                    {tab.key === 'ai-coding' && (
                                        <span className="ml-1 px-1.5 py-0.5 text-xs font-medium bg-nebula-500/20 text-nebula-300 rounded-md">
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
                            <div className={`flex items-center transition-all duration-300 ${searchFocused ? 'w-80' : 'w-64'}`}>
                                <MagnifyingGlassIcon className="absolute left-3 h-5 w-5 text-space-400" />
                                <input
                                    type="text"
                                    placeholder="搜索 Cosmic Blog"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                    className="w-full pl-10 pr-4 py-2 bg-space-800/60 border border-cosmic-500/30 rounded-xl text-sm text-space-200 placeholder-space-400 focus:outline-none focus:bg-space-800/80 focus:border-cosmic-400/50 focus:ring-2 focus:ring-cosmic-500/20 transition-all backdrop-blur-sm"
                                />
                            </div>
                        </form>

                        {isAuthenticated ? (
                            <div className="flex items-center space-x-3">
                                {/* 创作者中心 */}
                                <Menu as="div" className="relative">
                                    <Menu.Button className="flex items-center px-3 py-1.5 text-sm font-medium text-space-300 bg-space-800/60 hover:bg-space-700/60 rounded-full transition-all duration-300 border border-cosmic-500/30">
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        创作者中心
                                        <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </Menu.Button>

                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-200"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-150"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute right-0 mt-2 w-48 rounded-xl shadow-space-glow bg-space-900/90 backdrop-blur-xl border border-cosmic-500/20 focus:outline-none">
                                            <div className="py-1">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            href="/editor"
                                                            className={`${active ? 'bg-space-800/60' : ''} flex items-center px-4 py-2 text-sm text-space-300 hover:text-cosmic-300 transition-colors duration-300`}
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
                                                            className={`${active ? 'bg-space-800/60' : ''} flex items-center px-4 py-2 text-sm text-space-300 hover:text-cosmic-300 transition-colors duration-300`}
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
                                <button className="p-2 text-space-400 hover:text-nebula-400 relative transition-colors duration-300">
                                    <BellIcon className="h-6 w-6" />
                                    <span className="absolute top-0 right-0 h-2 w-2 bg-nebula-400 rounded-full animate-pulse"></span>
                                </button>

                                {/* 用户头像菜单 */}
                                <Menu as="div" className="relative">
                                    <Menu.Button className="flex items-center">
                                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cosmic-500 to-nebula-600 flex items-center justify-center text-white font-medium text-sm shadow-cosmic hover:shadow-nebula transition-all duration-300">
                                            {(user as any)?.username?.charAt(0).toUpperCase()}
                                        </div>
                                    </Menu.Button>

                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-200"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-150"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute right-0 mt-2 w-48 rounded-xl shadow-space-glow bg-space-900/90 backdrop-blur-xl border border-cosmic-500/20 focus:outline-none">
                                            <div className="px-4 py-3 border-b border-space-700/50">
                                                <p className="text-sm font-medium text-space-200">{(user as any)?.username}</p>
                                                <p className="text-xs text-space-400">{(user as any)?.email}</p>
                                            </div>
                                            <div className="py-1">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            href="/profile"
                                                            className={`${active ? 'bg-space-800/60' : ''} flex items-center px-4 py-2 text-sm text-space-300 hover:text-cosmic-300 transition-colors duration-300`}
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
                                                            className={`${active ? 'bg-space-800/60' : ''} flex items-center px-4 py-2 text-sm text-space-300 hover:text-cosmic-300 transition-colors duration-300`}
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
                                                            className={`${active ? 'bg-space-800/60' : ''} flex items-center w-full px-4 py-2 text-sm text-space-300 hover:text-nebula-400 transition-colors duration-300`}
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
                                    className="text-sm font-medium text-space-300 hover:text-cosmic-300 transition-colors duration-300"
                                >
                                    登录
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cosmic-600 to-nebula-600 hover:from-cosmic-700 hover:to-nebula-700 rounded-full transition-all duration-300 shadow-cosmic hover:shadow-nebula"
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
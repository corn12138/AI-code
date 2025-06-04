// 更复杂的导航栏实现
'use client';

import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PrimaryButton } from './ui/ClientButton';

interface NavbarProps {
    minimal?: boolean;
}

export default function Navbar({ minimal = false }: NavbarProps) {
    const { isAuthenticated, user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();

    // 监听滚动以改变导航栏样式
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className={`bg-white shadow-md py-4 sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-white shadow-sm'
            }`}>
            <div className="container-content">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="group flex items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary-600 text-white rounded flex items-center justify-center font-bold group-hover:bg-primary-700 transition-colors">
                                    T
                                </div>
                                <span className="text-xl font-serif font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">
                                    TechBlog
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* 中间导航链接 */}
                    {!minimal && (
                        <nav className="hidden md:flex space-x-1">
                            {[
                                { name: '首页', href: '/' },
                                { name: '标签', href: '/tags' },
                                { name: '专题', href: '/topics' },
                                { name: '文档', href: '/docs' },
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${pathname === item.href
                                        ? 'text-primary-700 bg-primary-50'
                                        : 'text-secondary-600 hover:text-primary-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            {isAuthenticated && (
                                <Link
                                    href="/editor"
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/editor'
                                        ? 'text-primary-700 bg-primary-50'
                                        : 'text-secondary-600 hover:text-primary-600 hover:bg-gray-50'
                                        }`}
                                >
                                    写文章
                                </Link>
                            )}
                        </nav>
                    )}

                    {/* 右侧认证区域 */}
                    <div className="flex items-center gap-2">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                >
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-secondary-200 ring-2 ring-white">
                                        <Image
                                            src={user?.avatar || 'https://via.placeholder.com/40'}
                                            alt={user?.username || 'User'}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                    <span className="hidden md:inline text-sm font-medium text-secondary-700">{user?.username}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-secondary-500">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {/* 下拉菜单 */}
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-secondary-100 overflow-hidden">
                                        <div className="px-4 py-2 border-b border-secondary-100">
                                            <p className="text-xs text-secondary-500">登录为</p>
                                            <p className="font-medium text-secondary-900 truncate">{user?.username}</p>
                                        </div>
                                        <Link href="/profile"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                                            onClick={() => setIsMenuOpen(false)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                            个人中心
                                        </Link>
                                        <Link href="/editor"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                                            onClick={() => setIsMenuOpen(false)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                            </svg>
                                            创作中心
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                            </svg>
                                            退出登录
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login"
                                    className="text-sm text-secondary-700 font-medium hover:text-primary-600 transition-colors">
                                    登录
                                </Link>
                                <Link href="/register"
                                    className="btn-primary text-sm">
                                    注册
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* 移动端菜单按钮 */}
                    <div className="md:hidden">
                        <PrimaryButton
                            onClick={toggleMenu}
                            className="p-2 rounded-md"
                        >
                            <span className="sr-only">打开菜单</span>
                            {isMenuOpen ? (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                            )}
                        </PrimaryButton>
                    </div>
                </div>

                {/* 移动端菜单 */}
                {isMenuOpen && (
                    <div className="absolute top-16 left-0 right-0 bg-white shadow-md py-2 md:hidden z-10">
                        <div className="flex flex-col space-y-2 px-4">
                            <Link href="/"
                                className="text-gray-700 hover:text-blue-600 py-2 transition-colors"
                                onClick={() => setIsMenuOpen(false)}>
                                首页
                            </Link>
                            <Link href="/tags"
                                className="text-gray-700 hover:text-blue-600 py-2 transition-colors"
                                onClick={() => setIsMenuOpen(false)}>
                                标签
                            </Link>
                            <Link href="/topics"
                                className="text-gray-700 hover:text-blue-600 py-2 transition-colors"
                                onClick={() => setIsMenuOpen(false)}>
                                专题
                            </Link>
                            {isAuthenticated && (
                                <>
                                    <Link href="/editor"
                                        className="text-gray-700 hover:text-blue-600 py-2 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}>
                                        写文章
                                    </Link>
                                    <Link href="/profile"
                                        className="text-gray-700 hover:text-blue-600 py-2 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}>
                                        个人中心
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                                    >
                                        退出登录
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

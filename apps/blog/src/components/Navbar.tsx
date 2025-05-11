import { useAuth } from '@shared/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface NavbarProps {
    minimal?: boolean;
}

export default function Navbar({ minimal = false }: NavbarProps) {
    const { isAuthenticated, user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/">
                            <div className="flex items-center">
                                <span className="text-xl font-bold text-blue-600">TechBlog</span>
                            </div>
                        </Link>
                    </div>

                    {/* 中间导航链接，在 minimal 模式下不显示 */}
                    {!minimal && (
                        <nav className="hidden md:flex space-x-8">
                            <Link href="/" className={`text-gray-700 hover:text-blue-600 ${router.pathname === '/' ? 'text-blue-600' : ''}`}>
                                首页
                            </Link>
                            <Link href="/tags" className={`text-gray-700 hover:text-blue-600 ${router.pathname === '/tags' ? 'text-blue-600' : ''}`}>
                                标签
                            </Link>
                            {isAuthenticated && (
                                <Link href="/editor" className={`text-gray-700 hover:text-blue-600 ${router.pathname === '/editor' ? 'text-blue-600' : ''}`}>
                                    写文章
                                </Link>
                            )}
                        </nav>
                    )}

                    {/* 右侧认证区域 */}
                    <div className="flex items-center">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center space-x-2 focus:outline-none"
                                >
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                                        <Image
                                            src={user?.avatar || 'https://via.placeholder.com/40'}
                                            alt={user?.username || 'User'}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                    <span className="hidden md:inline text-sm">{user?.username}</span>
                                </button>

                                {/* 下拉菜单 */}
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                        <Link href="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsMenuOpen(false)}>
                                            个人中心
                                        </Link>
                                        <Link href="/editor"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsMenuOpen(false)}>
                                            创作中心
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            退出登录
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex space-x-4">
                                <Link href="/login"
                                    className="text-blue-600 hover:text-blue-800">
                                    登录
                                </Link>
                                <Link href="/register"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                    注册
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* 移动端菜单按钮 */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-700 hover:text-blue-600 focus:outline-none"
                        >
                            <svg
                                className="h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 移动端菜单 */}
                {isMenuOpen && (
                    <div className="md:hidden pb-4">
                        <nav className="flex flex-col space-y-2">
                            <Link href="/"
                                className="px-2 py-1 text-gray-700 hover:text-blue-600"
                                onClick={() => setIsMenuOpen(false)}>
                                首页
                            </Link>
                            <Link href="/tags"
                                className="px-2 py-1 text-gray-700 hover:text-blue-600"
                                onClick={() => setIsMenuOpen(false)}>
                                标签
                            </Link>
                            {isAuthenticated && (
                                <>
                                    <Link href="/editor"
                                        className="px-2 py-1 text-gray-700 hover:text-blue-600"
                                        onClick={() => setIsMenuOpen(false)}>
                                        写文章
                                    </Link>
                                    <Link href="/profile"
                                        className="px-2 py-1 text-gray-700 hover:text-blue-600"
                                        onClick={() => setIsMenuOpen(false)}>
                                        个人中心
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="px-2 py-1 text-left text-gray-700 hover:text-blue-600"
                                    >
                                        退出登录
                                    </button>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}

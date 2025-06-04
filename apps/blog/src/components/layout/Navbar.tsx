'use client';

import { useAuth } from '@shared/auth';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import Link from 'next/link';
import { Fragment, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const pathname = usePathname();
    const [searchOpen, setSearchOpen] = useState(false);

    const navigation = [
        { name: '首页', href: '/', current: pathname === '/' },
        { name: '文章', href: '/articles', current: pathname === '/articles' || pathname.startsWith('/article/') },
        { name: '标签', href: '/tags', current: pathname === '/tags' },
        { name: '关于', href: '/about', current: pathname === '/about' },
    ];

    const profileLinks = [
        { name: '个人主页', href: `/author/${user?.id}` },
        { name: '我的文章', href: '/dashboard/articles' },
        { name: '我的评论', href: '/dashboard/comments' },
        { name: '账户设置', href: '/settings' },
    ];

    return (
        <Disclosure as="nav" className="bg-white shadow-sm">
            {({ open }) => (
                <>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex">
                                <div className="flex-shrink-0 flex items-center">
                                    <Link href="/" className="text-primary-600 font-bold text-xl">
                                        技术博客
                                    </Link>
                                </div>
                                <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${item.current
                                                ? 'border-primary-500 text-secondary-900'
                                                : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'
                                                }`}
                                            aria-current={item.current ? 'page' : undefined}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                                <button
                                    onClick={() => setSearchOpen(!searchOpen)}
                                    className="p-1 rounded-full text-secondary-500 hover:text-secondary-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>

                                {isAuthenticated ? (
                                    <>
                                        <Link href="/editor" className="btn-primary">
                                            写文章
                                        </Link>

                                        {/* 用户菜单 */}
                                        <Menu as="div" className="relative">
                                            <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                    {user?.avatar ? (
                                                        <div className="relative h-full w-full">
                                                            <Image
                                                                src={user.avatar}
                                                                alt={user.username}
                                                                fill
                                                                className="object-cover"
                                                                sizes="40px"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm font-medium text-gray-600">{user?.username?.charAt(0).toUpperCase()}</span>
                                                    )}
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
                                                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                    <div className="px-4 py-2 border-b">
                                                        <p className="text-sm text-gray-700 truncate">
                                                            {user?.username}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {user?.email}
                                                        </p>
                                                    </div>

                                                    {profileLinks.map((item) => (
                                                        <Menu.Item key={item.name}>
                                                            {({ active }) => (
                                                                <Link
                                                                    href={item.href}
                                                                    className={`${active ? 'bg-gray-100' : ''
                                                                        } block px-4 py-2 text-sm text-gray-700`}
                                                                >
                                                                    {item.name}
                                                                </Link>
                                                            )}
                                                        </Menu.Item>
                                                    ))}

                                                    <div className="border-t">
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button
                                                                    onClick={logout}
                                                                    className={`${active ? 'bg-gray-100' : ''
                                                                        } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                                                                >
                                                                    退出登录
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    </div>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </>
                                ) : (
                                    <div className="flex space-x-4">
                                        <Link href="/login" className="text-secondary-600 hover:text-secondary-900">
                                            登录
                                        </Link>
                                        <Link href="/register" className="btn-primary">
                                            注册
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <div className="-mr-2 flex items-center sm:hidden">
                                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-secondary-500 hover:text-secondary-700 hover:bg-gray-100">
                                    <span className="sr-only">{open ? '关闭菜单' : '打开菜单'}</span>
                                    {open ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    )}
                                </Disclosure.Button>
                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="sm:hidden">
                        <div className="pt-2 pb-3 space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${item.current
                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                                        }`}
                                    aria-current={item.current ? 'page' : undefined}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                        <div className="pt-4 pb-3 border-t border-gray-200">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center px-4">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                {user?.avatar ? (
                                                    <div className="relative h-full w-full">
                                                        <Image
                                                            src={user.avatar}
                                                            alt={user.username}
                                                            fill
                                                            className="object-cover"
                                                            sizes="40px"
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-medium text-gray-600">{user?.username?.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-base font-medium text-gray-800">{user?.username}</div>
                                            <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-1">
                                        {profileLinks.map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                        <button
                                            onClick={logout}
                                            className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                        >
                                            退出登录
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col space-y-3 px-4">
                                    <Link href="/login" className="text-center py-2 text-primary-600 hover:text-primary-800">
                                        登录
                                    </Link>
                                    <Link href="/register" className="btn-primary text-center">
                                        注册
                                    </Link>
                                </div>
                            )}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
}
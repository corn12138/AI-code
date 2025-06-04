'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: '首页', href: '/' },
    { label: '博客', href: '/blog' },
    { label: '标签', href: '/tags' },
    { label: '关于', href: '/about' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <header 
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-200',
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm' 
          : 'bg-white dark:bg-gray-900'
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary-600 flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="text-xl font-bold tracking-tight">TechBlog</span>
          </Link>
          
          <nav className="hidden md:flex gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {isAuthenticated ? (
            <>
              <Link href="/editor" className="hidden sm:block">
                <Button variant="outline" size="sm">
                  写文章
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                    <AvatarImage src={user?.avatar} alt={user?.username || '用户头像'} />
                    <AvatarFallback>{getInitials(user?.username || 'U')}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 text-sm">
                    <p className="text-xs text-gray-500 dark:text-gray-400">登录为</p>
                    <p className="font-medium truncate">{user?.username || '用户'}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">控制台</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/articles">我的文章</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/editor">创建文章</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">个人资料</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={handleSignOut}>
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  登录
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button size="sm">
                  注册
                </Button>
              </Link>
            </div>
          )}
          
          <button
            className="md:hidden p-2 rounded-md"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
                <line x1="4" x2="20" y1="12" y2="12"/>
                <line x1="4" x2="20" y1="6" y2="6"/>
                <line x1="4" x2="20" y1="18" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* 移动端导航菜单 */}
      {isMenuOpen && (
        <div className="container py-4 md:hidden border-t dark:border-gray-800">
          <nav className="flex flex-col space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-md text-base font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link 
                  href="/editor"
                  className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  写文章
                </Link>
                <Link 
                  href="/dashboard"
                  className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  控制台
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleSignOut();
                  }}
                  className="px-3 py-2 rounded-md text-left text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  退出登录
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Link 
                  href="/login"
                  className="px-3 py-2 rounded-md text-center text-base font-medium text-gray-700 border border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  登录
                </Link>
                <Link 
                  href="/register"
                  className="px-3 py-2 rounded-md text-center text-base font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  注册
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "订阅成功！",
        description: "感谢您的订阅，我们将定期发送最新内容到您的邮箱。",
        variant: "success",
      });
      setEmail('');
    } catch (error) {
      toast({
        title: "订阅失败",
        description: "请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-800">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded bg-primary-600 flex items-center justify-center text-white font-bold">
                T
              </div>
              <span className="text-xl font-bold tracking-tight">TechBlog</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
              一个分享技术知识和见解的博客平台，致力于帮助开发者成长和交流。
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="GitHub" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-500">首页</Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-500">博客</Link>
              </li>
              <li>
                <Link href="/tags" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-500">标签</Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-500">关于我们</Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-500">联系我们</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">资源</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/resources" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-500">学习资料</Link>
              </li>
              <li>
                <Link href="/docs" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-500">文档中心</Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-500">常见问题</Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-500">社区讨论</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">订阅更新</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              订阅我们的技术周刊，获取最新文章和技术动态
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="您的邮箱地址"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-sm"
                />
                <Button type="submit" disabled={isLoading} size="sm">
                  {isLoading ? '订阅中...' : '订阅'}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                我们尊重您的隐私，绝不会分享您的邮箱
              </p>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {currentYear} TechBlog. 保留所有权利。
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              隐私政策
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              服务条款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { useState } from 'react';

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
      toast.success("感谢您的订阅，我们将定期发送最新内容到您的邮箱。");
      setEmail('');
    } catch (error) {
      toast.error("订阅失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-space-900/80 backdrop-blur-xl border-t border-cosmic-500/20">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cosmic-500 to-nebula-600 flex items-center justify-center text-white font-bold shadow-cosmic group-hover:shadow-nebula transition-all duration-300">
                ✨
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-cosmic-300 to-nebula-300 bg-clip-text text-transparent">
                Cosmic Blog
              </span>
            </Link>
            <p className="text-space-400 text-sm leading-relaxed mb-6">
              一个分享技术知识和见解的博客平台，致力于帮助开发者成长和交流。
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="GitHub" className="text-space-400 hover:text-cosmic-400 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="text-space-400 hover:text-nebula-400 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </div>
          </div>

          {/* 栏目2：快速链接 */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-space-200">快速链接</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="inline-block text-space-400 hover:text-cosmic-300 transition-all duration-300 hover:translate-x-1 transform">
                  首页
                </Link>
              </li>
              <li>
                <Link href="/tags" className="inline-block text-space-400 hover:text-cosmic-300 transition-all duration-300 hover:translate-x-1 transform">
                  标签
                </Link>
              </li>
              <li>
                <Link href="/topics" className="inline-block text-space-400 hover:text-cosmic-300 transition-all duration-300 hover:translate-x-1 transform">
                  专题
                </Link>
              </li>
              <li>
                <Link href="/editor" className="inline-block text-space-400 hover:text-cosmic-300 transition-all duration-300 hover:translate-x-1 transform">
                  创作中心
                </Link>
              </li>
              <li>
                <Link href="/about" className="inline-block text-space-400 hover:text-cosmic-300 transition-all duration-300 hover:translate-x-1 transform">
                  关于我们
                </Link>
              </li>
            </ul>
          </div>

          {/* 栏目3：社区 */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-space-200">社区</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="inline-block text-space-400 hover:text-nebula-300 transition-all duration-300 hover:translate-x-1 transform">
                  开发者论坛
                </a>
              </li>
              <li>
                <a href="#" className="inline-block text-space-400 hover:text-nebula-300 transition-all duration-300 hover:translate-x-1 transform">
                  技术交流群
                </a>
              </li>
              <li>
                <a href="#" className="inline-block text-space-400 hover:text-nebula-300 transition-all duration-300 hover:translate-x-1 transform">
                  问题反馈
                </a>
              </li>
              <li>
                <a href="#" className="inline-block text-space-400 hover:text-nebula-300 transition-all duration-300 hover:translate-x-1 transform">
                  贡献指南
                </a>
              </li>
            </ul>
          </div>

          {/* 栏目4：订阅 */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-space-200">订阅更新</h3>
            <p className="text-space-400 text-sm mb-4">
              订阅我们的技术周刊，获取最新文章和技术动态
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="您的邮箱地址"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-sm bg-space-800/60 border-cosmic-500/30 text-space-200 placeholder-space-500 focus:ring-cosmic-500/20 focus:border-cosmic-400/50 backdrop-blur-sm"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-cosmic-600 to-nebula-600 text-white rounded-lg hover:from-cosmic-700 hover:to-nebula-700 transition-all duration-300 disabled:opacity-50 shadow-cosmic"
                >
                  {isLoading ? '订阅中...' : '订阅'}
                </button>
              </div>
              <p className="text-xs text-space-500">
                我们尊重您的隐私，绝不会分享您的邮箱
              </p>
            </form>
          </div>
        </div>

        <div className="border-t border-space-700/50 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-space-500">
            © {currentYear} Cosmic Blog. 保留所有权利。
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-space-400 hover:text-cosmic-300 transition-colors duration-300">
              隐私政策
            </Link>
            <Link href="/terms" className="text-sm text-space-400 hover:text-cosmic-300 transition-colors duration-300">
              服务条款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

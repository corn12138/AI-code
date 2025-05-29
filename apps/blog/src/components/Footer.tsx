import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            // 这里应该有实际的订阅处理逻辑
            setIsSubscribed(true);
            setEmail('');
            setTimeout(() => setIsSubscribed(false), 3000);
        }
    };

    return (
        <footer className="bg-gradient-to-b from-secondary-800 to-secondary-900 text-secondary-300">
            <div className="container-content py-12">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
                    {/* 栏目1：关于我们 */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-primary-500 text-white rounded flex items-center justify-center font-bold">
                                T
                            </div>
                            <span className="text-xl font-serif font-bold text-white">
                                TechBlog
                            </span>
                        </div>
                        <p className="text-secondary-400 mb-6 text-sm leading-relaxed">
                            一个技术博客与低代码开发平台，致力于分享技术知识和提供便捷的开发工具，让开发者更轻松地创造精彩的数字世界。
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-secondary-400 hover:text-white transition-colors" aria-label="Github">
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="#" className="text-secondary-400 hover:text-white transition-colors" aria-label="Twitter">
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* 栏目2：快速链接 */}
                    <div>
                        <h3 className="text-white text-base font-bold mb-4 border-l-2 border-primary-500 pl-3">快速链接</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="inline-block text-secondary-400 hover:text-white transition-colors hover:translate-x-0.5 transform">
                                    首页
                                </Link>
                            </li>
                            <li>
                                <Link href="/tags" className="inline-block text-secondary-400 hover:text-white transition-colors hover:translate-x-0.5 transform">
                                    标签
                                </Link>
                            </li>
                            <li>
                                <Link href="/topics" className="inline-block text-secondary-400 hover:text-white transition-colors hover:translate-x-0.5 transform">
                                    专题
                                </Link>
                            </li>
                            <li>
                                <Link href="/editor" className="inline-block text-secondary-400 hover:text-white transition-colors hover:translate-x-0.5 transform">
                                    创作中心
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="inline-block text-secondary-400 hover:text-white transition-colors hover:translate-x-0.5 transform">
                                    关于我们
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* 栏目3：社区 */}
                    <div>
                        <h3 className="text-white text-base font-bold mb-4 border-l-2 border-primary-500 pl-3">社区</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="inline-block text-secondary-400 hover:text-white transition-colors hover:translate-x-0.5 transform">
                                    开发者论坛
                                </a>
                            </li>
                            <li>
                                <a href="#" className="inline-block text-secondary-400 hover:text-white transition-colors hover:translate-x-0.5 transform">
                                    技术交流群
                                </a>
                            </li>
                            <li>
                                <a href="#" className="inline-block text-secondary-400 hover:text-white transition-colors hover:translate-x-0.5 transform">
                                    问题反馈
                                </a>
                            </li>
                            <li>
                                <a href="#" className="inline-block text-secondary-400 hover:text-white transition-colors hover:translate-x-0.5 transform">
                                    贡献指南
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* 栏目4：订阅 */}
                    <div className="md:col-span-2">
                        <h3 className="text-white text-base font-bold mb-4 border-l-2 border-primary-500 pl-3">订阅更新</h3>
                        <p className="text-secondary-400 mb-4 text-sm">
                            订阅我们的技术周刊，获取最新文章和技术动态。
                        </p>
                        <form onSubmit={handleSubscribe} className="space-y-2">
                            <div className="flex">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="您的电子邮件"
                                    className="flex-grow px-4 py-2.5 rounded-l-md bg-secondary-700 border border-secondary-600 text-white placeholder-secondary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-r-md transition-colors text-sm"
                                >
                                    订阅
                                </button>
                            </div>
                            {isSubscribed && (
                                <p className="text-green-400 text-xs mt-1">✓ 订阅成功！感谢您的支持。</p>
                            )}
                        </form>
                    </div>
                </div>

                <div className="border-t border-secondary-700 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-secondary-400 text-sm">© {currentYear} TechBlog. 保留所有权利</p>
                    <div className="mt-4 md:mt-0">
                        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                            <li>
                                <a href="#" className="text-secondary-400 hover:text-white transition-colors text-sm">
                                    隐私政策
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-secondary-400 hover:text-white transition-colors text-sm">
                                    服务条款
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-secondary-400 hover:text-white transition-colors text-sm">
                                    联系我们
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}

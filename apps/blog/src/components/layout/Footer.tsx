'use client';

import Link from 'next/link';
import { FC } from 'react';

interface FooterProps { }

const Footer: FC<FooterProps> = () => {
    return (
        <footer className="bg-gradient-to-b from-secondary-800 to-secondary-900 text-secondary-300">
            <div className="container-content py-12">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
                    {/* 栏目1：站内链接 */}
                    <div>
                        <h3 className="text-white text-base font-bold mb-4 border-l-2 border-primary-500 pl-3">站内链接</h3>
                        <ul className="space-y-2 text-sm">
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

                    {/* ...existing code... */}
                </div>

                {/* 版权信息 */}
                <div className="pt-8 mt-8 border-t border-secondary-700 text-center text-sm text-secondary-400">
                    <p>&copy; {new Date().getFullYear()} 技术博客与低代码平台. 保留所有权利.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
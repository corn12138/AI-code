// 服务器组件
import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-100 dark:bg-gray-800 py-8 mt-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between">
                    <div className="mb-6 md:mb-0">
                        <h3 className="font-bold text-xl mb-4">博客</h3>
                        <p className="text-gray-600 dark:text-gray-300">分享知识和想法</p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">链接</h4>
                        <ul className="space-y-2">
                            <li><Link href="/">首页</Link></li>
                            <li><Link href="/archives">归档</Link></li>
                            <li><Link href="/about">关于</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 text-center text-gray-600 dark:text-gray-400">
                    <p>© {currentYear} 我的博客. 保留所有权利.</p>
                </div>
            </div>
        </footer>
    );
}

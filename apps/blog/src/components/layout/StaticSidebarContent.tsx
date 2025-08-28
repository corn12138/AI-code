import {
    AcademicCapIcon,
    BeakerIcon,
    DocumentTextIcon,
    FireIcon,
    HomeIcon,
    MagnifyingGlassIcon,
    TagIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

/**
 * 静态侧边栏内容 - 服务端组件
 * 
 * 这些导航项不依赖于用户状态，可以在服务端渲染
 * 提供更好的SEO和首屏性能
 */

const publicNavItems = [
    { name: '最新', icon: HomeIcon, href: '/' },
    { name: '热门', icon: FireIcon, href: '/hot' },
    { name: '文章', icon: DocumentTextIcon, href: '/blog' },
    { name: '标签', icon: TagIcon, href: '/tags' },
    { name: '搜索', icon: MagnifyingGlassIcon, href: '/search' },
];

const developerItems = [
    { name: '文档中心', icon: AcademicCapIcon, href: '/docs' },
    { name: '实验功能', icon: BeakerIcon, href: '/labs' },
];

export function StaticSidebarContent() {
    return (
        <>
            {/* 公开导航 */}
            <nav className="space-y-2">
                {publicNavItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                    >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                    </Link>
                ))}
            </nav>

            {/* 开发者工具 */}
            <div className="pt-4 border-t border-gray-200">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    开发者工具
                </h3>
                <nav className="space-y-2">
                    {developerItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                        >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </>
    );
}

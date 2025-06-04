'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
    { href: '/', label: '首页' },
    { href: '/categories', label: '分类' },
    { href: '/about', label: '关于' },
];

export default function NavMenu() {
    const pathname = usePathname();

    return (
        <nav>
            <ul className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
                {navLinks.map(link => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className={`${pathname === link.href ? 'text-blue-600 font-bold' : 'text-gray-700 dark:text-gray-300'}`}
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

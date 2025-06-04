'use client';

import Link from 'next/link';
import { useState } from 'react';
import NavMenu from './NavMenu';
import ThemeToggle from './ThemeToggle';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold">博客</Link>

                <div className="flex items-center space-x-4">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden"
                    >
                        菜单
                    </button>
                    <div className="hidden md:block">
                        <NavMenu />
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden">
                    <NavMenu />
                </div>
            )}
        </header>
    );
}

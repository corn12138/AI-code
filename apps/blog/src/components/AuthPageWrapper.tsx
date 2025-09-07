'use client';

import React, { useEffect, useState } from 'react';
import Footer from './Footer';
import Navbar from './Navbar';
import { StarryBackground, StarryParticles } from './ui/StarryBackground';

export default function AuthPageWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <StarryBackground>
            <StarryParticles />
            <div className="flex flex-col min-h-screen">
                {/* 使用 minimal 版本的 Navbar，隐藏导航标签 */}
                <Navbar minimal />
                <main className="flex-grow">
                    {mounted ? children : (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmic-500"></div>
                        </div>
                    )}
                </main>
                <Footer />
            </div>
        </StarryBackground>
    );
} 
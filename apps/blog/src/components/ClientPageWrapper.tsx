'use client';

import React, { useEffect, useState } from 'react';
import Footer from './Footer';
import Navbar from './Navbar';

export default function ClientPageWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                {mounted ? children : (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

'use client';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { ReactNode } from 'react';

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
}

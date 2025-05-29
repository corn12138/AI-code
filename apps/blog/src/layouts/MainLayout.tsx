import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { ReactNode, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

interface MainLayoutProps {
    children: ReactNode;
    fullWidth?: boolean;
}

export default function MainLayout({ children, fullWidth = false }: MainLayoutProps) {
    const [showBackToTop, setShowBackToTop] = useState(false);

    // 监听滚动显示/隐藏回到顶部按钮
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 回到顶部
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-grow pt-6 pb-12">
                {fullWidth ? children : (
                    <div className="container-content">
                        {children}
                    </div>
                )}
            </main>

            <Footer />

            {/* 回到顶部按钮 */}
            {showBackToTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 p-3 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all z-30"
                    aria-label="返回顶部"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            )}

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                        borderRadius: '8px',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10B981',
                            secondary: '#FFFFFF',
                        },
                    },
                }}
            />
        </div>
    );
}

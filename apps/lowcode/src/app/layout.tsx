'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';
import registerServiceWorker from '../utils/registerServiceWorker';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        registerServiceWorker();
    }, []);

    return (
        <html lang="zh-CN">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#1a4cbe" />
                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/logo-192x192.png" />
                <title>低代码平台</title>
            </head>
            <body>
                {children}
                <Toaster position="top-right" />
            </body>
        </html>
    );
}

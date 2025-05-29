import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import styles from '../styles/Layout.module.css';

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
}

const Layout = ({ children, title = '博客网站' }: LayoutProps) => {
    // 使用useState和useEffect处理客户端状态
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <div className={styles.container}>
            <Head>
                <title>{title}</title>
                <meta name="description" content="一个现代化的博客网站" />
                <link rel="icon" href="/favicon.ico" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <header className={styles.header}>
                <div className={styles.logo}>我的博客</div>
                <nav className={styles.nav}>
                    <a href="/">首页</a>
                    <a href="/blog">文章</a>
                    <a href="/about">关于</a>
                </nav>
            </header>

            <main className={styles.main}>
                {children}
            </main>

            <footer className={styles.footer}>
                <p>© {new Date().getFullYear()} 我的博客. 保留所有权利.</p>
            </footer>
        </div>
    );
};

export default Layout;
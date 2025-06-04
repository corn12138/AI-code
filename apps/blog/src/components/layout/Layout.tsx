'use client';

import Head from 'next/head';
import { useEffect, useState } from 'react';
import styles from '../../styles/Layout.module.css';

const Layout = ({ children }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            <Head>
                <title>My App</title>
                <meta name="description" content="My app description" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>My App</h1>
                </header>
                <main className={styles.main}>{mounted && children}</main>
                <footer className={styles.footer}>
                    <p>© 2023 My App. All rights reserved.</p>
                </footer>
            </div>
        </>
    );
};

export default Layout;
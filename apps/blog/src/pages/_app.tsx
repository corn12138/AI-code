import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <Layout>
            <div style={{ opacity: mounted ? 1 : 0 }}>
                <Component {...pageProps} />
            </div>
        </Layout>
    );
}

export default MyApp;
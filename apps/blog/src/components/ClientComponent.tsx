import { useEffect, useState } from 'react';

const ClientComponent = () => {
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        // 这段代码只在客户端执行
        setCurrentTime(new Date().toLocaleTimeString());

        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div>
            <p>这个组件仅在客户端渲染</p>
            <p>当前客户端时间: {currentTime}</p>
        </div>
    );
};

export default ClientComponent;

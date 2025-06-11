'use client';

import { ReactNode, useEffect } from 'react';

type DebugProps = {
    children: ReactNode;
    componentName?: string;
    showInfo?: boolean;
};

// 仅在开发环境中显示的服务器组件调试信息
export function DebugServer({ children, componentName = '未命名组件', showInfo = true }: DebugProps) {
    if (process.env.NODE_ENV !== 'development' || !showInfo) {
        return <>{children}</>;
    }

    return (
        <div style={{
            position: 'relative',
            border: '1px dashed #0070f3',
            padding: '8px',
            margin: '8px 0',
            borderRadius: '4px'
        }}>
            <div style={{
                position: 'absolute',
                top: '-10px',
                left: '8px',
                background: '#fff',
                padding: '0 4px',
                fontSize: '12px',
                color: '#0070f3'
            }}>
                服务器组件: {componentName}
            </div>
            {children}
        </div>
    );
}

// 显示服务器组件渲染时间的工具
export function ServerRenderInfo() {
    const renderTime = new Date().toLocaleString('zh-CN');

    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div style={{
            background: '#f0f0f0',
            padding: '4px 8px',
            marginBottom: '10px',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#666'
        }}>
            服务器渲染时间===: {renderTime}
        </div>
    );
}

export function DebugServerComponents() {
    useEffect(() => {
        console.log('===开始检查服务器组件错误===');

        // 记录渲染的组件结构
        console.log('页面DOM结构:', document.body.innerHTML);

        // 找到所有按钮元素
        const buttons = document.querySelectorAll('button');
        console.log(`找到 ${buttons.length} 个按钮元素`);

        buttons.forEach((button, index) => {
            console.log(`按钮 ${index}:`, button.outerHTML);
        });
    }, []);

    return null;
}

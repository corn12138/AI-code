import dynamic from 'next/dynamic';

// 使用这个函数来强制组件只在客户端渲染
export function clientOnly<T>(Component: T): T {
    return dynamic(() => Promise.resolve(Component as any), { ssr: false }) as any;
}

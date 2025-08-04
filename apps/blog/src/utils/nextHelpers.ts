import dynamic from 'next/dynamic';

// 使用这个函数来强制组件只在客户端渲染
// 注意：这个函数返回的组件只能在Client Components中使用
export function clientOnly<T>(Component: T): T {
    // 为了兼容Next.js 15，这个函数现在返回一个需要在Client Component中使用的动态组件
    return dynamic(() => Promise.resolve(Component as any), { ssr: false }) as any;
}

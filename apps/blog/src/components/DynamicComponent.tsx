import dynamic from 'next/dynamic';

// 示例: 动态导入一个依赖浏览器环境的组件
const DynamicComponentWithNoSSR = dynamic(
    () => import('./YourBrowserDependentComponent'),
    { ssr: false }
);

export default DynamicComponentWithNoSSR;

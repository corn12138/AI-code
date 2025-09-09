import { defineConfig } from 'umi'
import { routes } from './src/router/routes'

export default defineConfig({
    // 路由配置
    routes,

    // 构建配置
    outputPath: 'dist',
    // 默认用于 Web 部署；若要打包为 iOS 离线包，请设置环境变量 HYBRID_PUBLIC_PATH=./
    publicPath: process.env.HYBRID_PUBLIC_PATH ?? '/',
    hash: false,

    // 开发配置
    proxy: {
        '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
            pathRewrite: { '^/api': '/api' },
        },
    },

    // 插件配置
    plugins: [
        '@umijs/plugins/dist/tailwindcss',
    ],

    // Tailwind CSS 配置
    tailwindcss: {},



    // 标题配置
    title: '移动端应用',

    // 路径别名配置
    alias: {
        '@': './src',
        '@components': './src/components',
        '@pages': './src/pages',
        '@utils': './src/utils',
        '@hooks': './src/hooks',
        '@store': './src/store',
        '@types': './src/types',
        '@services': './src/services',
        // 兼容层：修复部分历史用法（图标命名差异与 Spin 别名）
        'antd-mobile-icons$': '@/shims/antd-mobile-icons-compat',
        'antd-mobile$': '@/shims/antd-mobile-compat',
    },

    // 快速刷新
    fastRefresh: true,

    // 浏览器兼容性
    targets: {
        // 提升编译目标，减少 esbuild 压缩兼容问题
        chrome: 80,
        firefox: 72,
        safari: 12,
        edge: 80,
        ios: 12,
        android: '7',
    },

    // 环境变量
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },

    // Meta 配置
    metas: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
    ],

    // 使用 terser 进行压缩以规避 esbuild 压缩兼容问题
    jsMinifier: 'terser',
})

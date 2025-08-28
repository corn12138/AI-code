import { defineConfig } from 'umi'
import { routes } from './src/router/routes'

export default defineConfig({
    // 路由配置
    routes,

    // 构建配置
    outputPath: 'dist',
    publicPath: '/',
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
    },

    // 快速刷新
    fastRefresh: true,

    // 浏览器兼容性
    targets: {
        chrome: 70,
        firefox: 64,
        safari: 10,
        edge: 13,
        ios: 10,
        android: '4.4',
    },

    // 环境变量
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },

    // Meta 配置
    metas: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
    ],
})
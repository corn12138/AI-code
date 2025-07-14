const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@shared/ui', '@shared/utils', '@shared/auth'],
    images: {
        domains: [
            'images.unsplash.com',
            'via.placeholder.com',
            'avatars.githubusercontent.com',
            'res.cloudinary.com',
            'api.dicebear.com'
        ],
    },
    // 移除 API 重写规则，让 Next.js 处理 API 路由
    // async rewrites() {
    //     return [
    //         {
    //             source: '/api/:path*',
    //             destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/:path*`,
    //         },
    //     ];
    // },
    webpack: (config, { isServer }) => {
        // 修复SSR问题
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
            };
        }
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': path.resolve(__dirname, './src'),
            '@shared': path.resolve(__dirname, '../../shared'),
        };
        return config;
    }
}

module.exports = nextConfig

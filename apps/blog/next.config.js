/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@shared/ui', '@shared/utils', '@shared/auth'],
    images: {
        domains: ['placekitten.com', 'images.unsplash.com'],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: '/api/:path*', // 修复：添加正确的目标路径，而不是undefined
            },
        ];
    },
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'images.unsplash.com',
            // 添加其他你需要的图片域名
        ],
    },
    // 如果你使用mdx
    experimental: {
        mdxRs: true,
    },
}

module.exports = nextConfig

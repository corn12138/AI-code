import { defineConfig } from 'dumi';

// 环境判断
const isProduction = process.env.NODE_ENV === 'production';
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
const isNetlify = process.env.NETLIFY === 'true';

// 根据部署环境设置基础路径
let base = '/';
let publicPath = '/';

if (isGitHubPages) {
  base = '/ai-code-hooks/';
  publicPath = '/ai-code-hooks/';
} else if (isNetlify || isProduction) {
  base = '/';
  publicPath = '/';
}

export default defineConfig({
  outputPath: 'docs-dist',

  // 动态设置基础路径
  base,
  publicPath,

  // 开启静态导出
  exportStatic: {},

  // 开启 hash 路由
  hash: true,

  // 站点信息
  title: 'AI-Code Hooks',

  // 主题配置
  themeConfig: {
    name: 'AI-Code Hooks',
    logo: false,

    // 顶部导航
    nav: [
      { title: '🏠 首页', link: '/' },
      { title: '🚀 快速开始', link: '/guide' },
      { title: '🎮 交互示例', link: '/examples' },
      { title: '📚 Hooks', link: '/hooks' },
      { title: '🌟 GitHub', link: 'https://github.com/corn12138/ai-code-hooks' },
      { title: '📦 NPM', link: 'https://www.npmjs.com/package/@corn12138/hooks' }
    ],

    // 侧边栏
    sidebar: {
      '/': [
        {
          title: '开始使用',
          children: [
            { title: '快速开始', link: '/guide' },
            { title: '交互式示例', link: '/examples' },
          ],
        },
        {
          title: 'Hooks API',
          children: [
            { title: 'useAuth', link: '/use-auth' },
            { title: 'useAsync', link: '/use-async' },
            { title: 'useForm', link: '/use-form' },
            { title: 'useNetworkStatus', link: '/use-network-status' },
            { title: 'useLocalStorage', link: '/use-local-storage' },
            { title: 'useWindowSize', link: '/use-window-size' },
            { title: 'useApi', link: '/use-api' },
            { title: 'useEditor', link: '/use-editor' },
            { title: 'useDebounce', link: '/use-debounce' },
            { title: 'useClientSide', link: '/use-client-side' },
          ],
        },
      ],
    },

    // 社交链接
    socialLinks: {
      github: 'https://github.com/corn12138/ai-code-hooks',
    },

    // 页脚
    footer: `Copyright © ${new Date().getFullYear()} AI-Code Hooks. Built with ❤️ using Dumi.`,

    // 编辑链接
    editLink: false,
  },

  // 文档配置
  resolve: {
    docDirs: ['docs', 'src'],
  },

  // 禁用 MFSU 避免模块解析问题
  mfsu: false,

  // 分析工具
  analytics: {
    // 可以添加 Google Analytics
    // ga: 'G-XXXXXXXXXX',
  },

  // 构建优化
  chainWebpack(config) {
    // 生产环境优化
    if (isProduction) {
      config.optimization.minimize(true);
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      });
    }
  },
}); 
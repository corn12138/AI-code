import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'AI-Code Hooks',
    logo: false,
    nav: [
      { title: '🏠 首页', link: '/' },
      { title: '🚀 快速开始', link: '/guide' },
      { title: '🎮 交互示例', link: '/examples' },
      { title: '📚 Hooks', link: '/hooks' },
    ],
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
  },
  // 禁用 MFSU 避免模块解析问题
  mfsu: false,
  // 设置文档目录
  resolve: {
    docDirs: ['docs', 'src'],
  },
}); 
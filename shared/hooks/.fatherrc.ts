import { defineConfig } from 'father';

export default defineConfig({
  esm: {
    output: 'dist',
  },
  cjs: {
    output: 'dist',
  },
  // Father 4.x的正确配置格式
  platform: 'browser',
  // 确保React被正确外部化
  // externals: {
  //   react: 'react',
  //   'react-dom': 'react-dom',
  // },
  // umd: {
  //   output: 'dist',
  //   name: 'AiCodeHooks',
  //   externals: {
  //     react: 'React',
  //     'react-dom': 'ReactDOM',
  //   },
  // },
}); 
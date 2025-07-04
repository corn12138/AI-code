import { defineConfig } from 'father';

export default defineConfig({
  esm: { output: 'dist' },
  cjs: { output: 'dist' },
  umd: {
    output: 'dist',
    name: 'AiCodeHooks',
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
  },
}); 
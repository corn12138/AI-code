import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isNativeBuild = mode === 'native';

  return {
    plugins: [react(), tsconfigPaths()],
    base: isNativeBuild ? './' : '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@corn12138/hooks': path.resolve(__dirname, '../../shared/hooks/src'),
        '@shared/auth': path.resolve(__dirname, '../../shared/auth/src'),
        '@shared/ui': path.resolve(__dirname, '../../shared/ui/src'),
        '@shared/utils': path.resolve(__dirname, '../../shared/utils/src')
      }
    },
    server: {
      port: isNativeBuild ? 3002 : 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: isNativeBuild ? 'dist-native' : 'dist',
      sourcemap: !isNativeBuild, // 原生构建不需要sourcemap
      assetsDir: 'assets',
      rollupOptions: {
        output: isNativeBuild ? {
          // 原生构建：确保文件名稳定，便于缓存
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        } : {
          // 常规构建：使用默认的分包策略
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['clsx', 'lucide-react', 'react-hot-toast'],
            'store-vendor': ['zustand']
          }
        }
      }
    },
    ssr: {
      // SSR构建配置
      noExternal: ['react-router-dom', 'zustand', 'clsx', 'lucide-react', 'react-hot-toast'],
    }
  };
});

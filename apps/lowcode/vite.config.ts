import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ai-code/hooks': path.resolve(__dirname, '../../shared/hooks/src'),
      '@shared/auth': path.resolve(__dirname, '../../shared/auth/src'),
      '@shared/ui': path.resolve(__dirname, '../../shared/ui/src'),
      '@shared/utils': path.resolve(__dirname, '../../shared/utils/src')
    }
  },
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'dnd-vendor': ['react-dnd', 'react-dnd-html5-backend'],
          'monaco-editor': ['@monaco-editor/react']
        }
      }
    }
  }
});

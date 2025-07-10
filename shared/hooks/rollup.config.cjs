const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const terser = require('@rollup/plugin-terser');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const { visualizer } = require('rollup-plugin-visualizer');
const filesize = require('rollup-plugin-filesize');
const copy = require('rollup-plugin-copy');

const packageJson = require('./package.json');

// 是否为生产构建
const isProduction = process.env.NODE_ENV === 'production';

// 基础配置
const baseConfig = {
    input: 'src/index.ts',
    external: ['react', 'react-dom'],
    plugins: [
        // 自动排除 peerDependencies
        peerDepsExternal(),

        // 解析 node_modules 中的依赖
        resolve({
            browser: true,
            preferBuiltins: false,
        }),

        // 转换 CommonJS 模块
        commonjs(),

        // TypeScript 编译
        typescript({
            tsconfig: './tsconfig.json',
            declaration: true,
            declarationDir: 'dist/types',
            rootDir: 'src',
            exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.stories.tsx'],
        }),

        // 复制必要文件
        copy({
            targets: [
                { src: 'README.md', dest: 'dist' },
                { src: 'LICENSE', dest: 'dist' },
            ],
        }),

        // 显示文件大小
        filesize(),

        // 生产环境压缩
        ...(isProduction ? [terser({
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
            mangle: {
                reserved: ['useAuth', 'useDebounce', 'useAsync'], // 保留 hook 名称
            },
        })] : []),

        // 构建分析（仅在需要时启用）
        ...(process.env.ANALYZE ? [visualizer({
            filename: 'dist/bundle-analysis.html',
            open: true,
        })] : []),
    ],
};

module.exports = [
    // ESM 构建
    {
        ...baseConfig,
        output: {
            file: packageJson.module,
            format: 'esm',
            sourcemap: true,
            banner: `'use client';
/**
 * ${packageJson.name} v${packageJson.version}
 * ${packageJson.description}
 * 
 * @author ${packageJson.author.name}
 * @license ${packageJson.license}
 */`,
        },
    },

    // CommonJS 构建
    {
        ...baseConfig,
        output: {
            file: packageJson.main,
            format: 'cjs',
            sourcemap: true,
            exports: 'named',
            banner: `'use client';
/**
 * ${packageJson.name} v${packageJson.version}
 * ${packageJson.description}
 * 
 * @author ${packageJson.author.name}
 * @license ${packageJson.license}
 */`,
        },
    },

    // UMD 构建 (用于 CDN)
    {
        ...baseConfig,
        output: {
            file: 'dist/index.umd.js',
            format: 'umd',
            name: 'AiCodeHooks',
            sourcemap: true,
            globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
            },
            banner: `'use client';
/**
 * ${packageJson.name} v${packageJson.version}
 * ${packageJson.description}
 * 
 * @author ${packageJson.author.name}
 * @license ${packageJson.license}
 */`,
        },
    },
]; 
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const terser = require('@rollup/plugin-terser');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');

const packageJson = require('./package.json');
const fs = require('fs');
const path = require('path');

// 是否为生产构建
const isProduction = process.env.NODE_ENV === 'production';

// 简单的文件大小显示插件
const filesizePlugin = () => ({
    name: 'filesize',
    generateBundle(options, bundle) {
        Object.keys(bundle).forEach(fileName => {
            const file = bundle[fileName];
            if (file.type === 'chunk' || file.type === 'asset') {
                const size = Buffer.byteLength(file.type === 'chunk' ? file.code : file.source);
                const gzippedSize = require('zlib').gzipSync(file.type === 'chunk' ? file.code : file.source).length;
                console.log(`📦 ${fileName}: ${(size / 1024).toFixed(2)} KB (${(gzippedSize / 1024).toFixed(2)} KB gzipped)`);
            }
        });
    }
});

// 复制文件插件
const copyPlugin = () => ({
    name: 'copy',
    writeBundle() {
        // 确保 dist 目录存在
        if (!fs.existsSync('dist')) {
            fs.mkdirSync('dist', { recursive: true });
        }

        // 复制 README.md
        if (fs.existsSync('README.md')) {
            fs.copyFileSync('README.md', 'dist/README.md');
            console.log('📄 Copied README.md to dist/');
        }

        // 复制 LICENSE
        if (fs.existsSync('LICENSE')) {
            fs.copyFileSync('LICENSE', 'dist/LICENSE');
            console.log('📄 Copied LICENSE to dist/');
        }
    }
});

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
        copyPlugin(),

        // 显示文件大小
        filesizePlugin(),

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
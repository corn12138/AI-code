module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: [
        '@typescript-eslint',
    ],
    rules: {
        // TypeScript specific rules
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'warn',

        // General rules
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars
        'prefer-const': 'error',
        'no-var': 'error',

        // React Hooks rules (if needed)
        'react-hooks/rules-of-hooks': 'off', // We'll handle this manually
        'react-hooks/exhaustive-deps': 'off', // We'll handle this manually
    },
    ignorePatterns: [
        'dist',
        'node_modules',
        'coverage',
        '.dumi',
        '*.d.ts',
    ],
    overrides: [
        {
            files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
            rules: {
                '@typescript-eslint/no-explicit-any': 'off',
                'no-console': 'off',
            },
        },
    ],
}; 
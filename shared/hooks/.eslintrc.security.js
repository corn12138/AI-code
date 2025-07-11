module.exports = {
    extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        'plugin:security/recommended'
    ],
    plugins: ['security'],
    rules: {
        // 安全相关规则
        'security/detect-object-injection': 'error',
        'security/detect-non-literal-fs-filename': 'error',
        'security/detect-non-literal-regexp': 'error',
        'security/detect-non-literal-require': 'error',
        'security/detect-possible-timing-attacks': 'error',
        'security/detect-pseudoRandomBytes': 'error',
        'security/detect-unsafe-regex': 'error',
        'security/detect-buffer-noassert': 'error',
        'security/detect-child-process': 'error',
        'security/detect-disable-mustache-escape': 'error',
        'security/detect-eval-with-expression': 'error',
        'security/detect-no-csrf-before-method-override': 'error',
        'security/detect-new-buffer': 'error',

        // TypeScript 安全规则
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-return': 'warn',

        // 防止危险的DOM操作
        'no-innerHTML': 'off', // 由于是React hooks库，这个规则不适用

        // 变量声明安全
        'no-unused-vars': 'error',
        'no-undef': 'error',
        'no-global-assign': 'error',
        'no-implicit-globals': 'error',

        // 防止原型污染
        'no-prototype-builtins': 'error',
        'no-extend-native': 'error'
    },
    env: {
        browser: true,
        node: true,
        es6: true
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        }
    }
}; 
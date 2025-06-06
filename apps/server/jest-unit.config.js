module.exports = {
    moduleFileExtensions: [
        'js',
        'json',
        'ts',
    ],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
        '**/*.service.ts',
        '**/*.controller.ts',
        '!**/node_modules/**',
        '!**/dist/**',
    ],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    // 忽略e2e测试文件
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '.e2e-spec.ts',
    ],
};

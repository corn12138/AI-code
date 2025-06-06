module.exports = {
    moduleFileExtensions: [
        'js',
        'json',
        'ts',
    ],
    rootDir: './',
    testRegex: '.e2e-spec.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
        '**/*.service.ts',
        '**/*.controller.ts',
        '!**/node_modules/**',
        '!**/dist/**',
    ],
    coverageDirectory: './coverage-integration',
    testEnvironment: 'node',
};

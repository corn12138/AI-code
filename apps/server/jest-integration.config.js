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
    // Use Testcontainers to provision ephemeral Postgres for integration/e2e tests
    globalSetup: '<rootDir>/test/testcontainers-setup.js',
    globalTeardown: '<rootDir>/test/testcontainers-teardown.js',
    setupFilesAfterEnv: [
        '<rootDir>/test/testcontainers-env.js',
    ],
    collectCoverageFrom: [
        '**/*.service.ts',
        '**/*.controller.ts',
        '!**/node_modules/**',
        '!**/dist/**',
    ],
    coverageDirectory: './coverage-integration',
    testEnvironment: 'node',
};

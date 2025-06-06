module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': ['ts-jest', {
            tsconfig: 'tsconfig.json'
        }]
    },
    collectCoverageFrom: [
        '**/*.service.(t|j)s',
        '**/*.controller.(t|j)s',
        '!**/node_modules/**',
    ],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/$1'
    }
};

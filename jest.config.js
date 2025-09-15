/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx|js)'],
    collectCoverageFrom: ['app/api/**/*.ts', 'lib/**/*.ts'],
};


























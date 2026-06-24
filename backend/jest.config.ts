//import type { Config } from '@jest/types';

//const config: Config.InitialOptions = {
//  preset: 'ts-jest',
//  testEnvironment: 'node',
//  roots: ['<rootDir>/src/tests'],
//  testMatch: ['**/*.test.ts'],
//  collectCoverageFrom: [
//    'src/**/*.ts',
//    '!src/**/*.d.ts',
//    '!src/server.ts'
//  ],
//  coverageDirectory: 'coverage',
//  coverageThreshold: {
//    global: {
//      branches: 80,
//      functions: 80,
//      lines: 80,
 //     statements: 80
//    }
//  },
//  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
//  verbose: true
//};

//export default config;*/

// jest.config.ts
// jest.config.ts
import type { Config } from '@jest/types';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src/tests'],
    testMatch: ['**/*.test.ts'],
    verbose: true,
    maxWorkers: 1, // Esto hace que TODO corra secuencialmente
    setupFilesAfterEnv: ['<rootDir>/src/tests/helpers/setup.ts'],
    globalSetup: '<rootDir>/src/tests/integration/global-setup.ts',
    globalTeardown: '<rootDir>/src/tests/integration/global-teardown.ts',
    collectCoverageFrom: [
        'src/modulos/**/*.ts',
        '!src/modulos/**/*.model.ts',
        '!src/**/*.d.ts',
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/config/',
        '/helpers/',
    ],
    transformIgnorePatterns: [
        'node_modules/(?!(@qlever-llc|pg-tmp)/)',
    ],
    moduleNameMapper: {
        '@qlever-llc/verify-pdf': '<rootDir>/src/tests/helpers/mocks/verify-pdf.ts',
    },
};

export default config;
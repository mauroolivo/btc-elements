import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/app/**/(layout|page).tsx',
  ],
  coveragePathIgnorePatterns: ['node_modules', '.next'],
  // Phase 1 thresholds disabled: focus on building tests, not coverage
  // Will be enabled progressively in Phase 5
  // coverageThreshold: {
  //   global: {
  //     statements: 1,
  //     branches: 1,
  //     functions: 1,
  //     lines: 1,
  //   },
  // },
};

export default createJestConfig(customJestConfig);

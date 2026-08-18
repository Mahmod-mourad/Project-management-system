const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

// Unit tests only. Integration and E2E need a running API and live in their own
// config (jest.integration.config.js). Backend specs are NestJS and run from
// backend/ with ts-jest, because the Next.js SWC transform here does not enable
// the decorator support NestJS relies on.
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/jest.config.js',
  ],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/backend/',
    '/__tests__/integration/',
    '/__tests__/e2e/',
  ],
  // Scoped to the modules the unit tests actually cover, set just under the
  // measured numbers so the gate is real. A global target here would only be a
  // number the suite cannot meet — raise these as more tests are written.
  coverageThreshold: {
    './lib/api-client.ts': {
      statements: 50,
      branches: 70,
      functions: 35,
      lines: 50,
    },
    './lib/validators.ts': {
      statements: 75,
      branches: 75,
      functions: 100,
      lines: 100,
    },
    './hooks/use-auth.tsx': {
      statements: 85,
      branches: 95,
      functions: 85,
      lines: 85,
    },
  },
}

module.exports = createJestConfig(customJestConfig)

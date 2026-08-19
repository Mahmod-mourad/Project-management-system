const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

// Integration and E2E tests talk to a real API over HTTP. They are kept out of
// the default `pnpm test` run and out of CI, because they need the backend and
// its database running first:
//
//   docker compose up -d
//   pnpm test:integration
//
// Point them somewhere else with NEXT_PUBLIC_API_URL and FRONTEND_URL.
const customJestConfig = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '<rootDir>/__tests__/integration/**/*.[jt]s?(x)',
    '<rootDir>/__tests__/e2e/**/*.[jt]s?(x)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/backend/'],
  testTimeout: 30000,
  collectCoverage: false,
}

module.exports = createJestConfig(customJestConfig)

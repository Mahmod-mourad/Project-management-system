# Testing Guide

This document outlines the comprehensive testing strategy for the ERP System.

## Test Structure

The project includes four levels of testing:

### 1. Unit Tests
- **Frontend**: Component and utility function tests
- **Backend**: Service and utility function tests
- **Location**: `__tests__/` and `.spec.ts` files
- **Runner**: Jest
- **Coverage Target**: >50%

### 2. Integration Tests
- **Focus**: API endpoints and data flow
- **Location**: `__tests__/integration/`
- **Scope**: Tests API contracts and tenant isolation
- **Runner**: Jest with fetch API

### 3. E2E Tests
- **Focus**: Complete user workflows
- **Location**: `__tests__/e2e/`
- **Scope**: Auth flow, user management, data consistency
- **Runner**: Jest with HTTP requests

### 4. Database Tests
- **Focus**: Schema and migrations
- **Location**: `scripts/`
- **Scope**: SQL migrations and RLS policies

## Running Tests

### Frontend Tests

```bash
# Run all frontend tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test:coverage

# Run specific test file
npm test -- auth.test.ts
```

### Backend Tests

```bash
# Run all backend tests
cd backend
npm test

# Run with coverage
npm test:cov

# Run specific test file
npm test -- auth.service.spec.ts

# Run in watch mode
npm test:watch

# Debug tests
npm test:debug
```

### Integration Tests

```bash
# Make sure backend is running first
npm test -- __tests__/integration/

# With environment variables
BACKEND_URL=http://localhost:3001 npm test -- __tests__/integration/
```

### E2E Tests

```bash
# Run E2E tests (requires both frontend and backend running)
npm test -- __tests__/e2e/

# With specific URLs
FRONTEND_URL=http://localhost:3000 NEXT_PUBLIC_API_URL=http://localhost:3001/api npm test -- __tests__/e2e/
```

### All Tests

```bash
# Frontend tests
npm run test:ci

# Backend tests
cd backend && npm run test:cov

# Combined coverage
npm run test:coverage && cd backend && npm run test:cov
```

## Test Coverage

### Current Coverage Goals

- **Statements**: >50%
- **Branches**: >50%
- **Functions**: >50%
- **Lines**: >50%

### Viewing Coverage Reports

```bash
# Frontend coverage report
npm run test:coverage
open coverage/index.html

# Backend coverage report
cd backend
npm run test:cov
open coverage/index.html
```

## Test Categories

### Unit Tests

#### Frontend (`__tests__/hooks/`, `__tests__/lib/`)
- `use-auth.test.ts` - Authentication hook
- `api-client.test.ts` - API client functionality
- `data-integration.test.ts` - Data integration service

#### Backend (`backend/src/**/*.spec.ts`)
- `auth.service.spec.ts` - Authentication service
- `tenant.service.spec.ts` - Tenant management service

### Integration Tests (`__tests__/integration/`)
- `api.integration.test.ts` - Complete API contract testing

### E2E Tests (`__tests__/e2e/`)
- `auth-flow.e2e.test.ts` - Complete authentication workflow

## Test Environment Setup

### Frontend Environment Variables

Create `.env.test` for test-specific variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend Environment Variables

Create `backend/.env.test`:

```env
DATABASE_URL=postgresql://test:test@localhost:5432/erp_test
JWT_SECRET=test-secret
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

## Mocking

### Frontend Mocks

```typescript
// Mock next/router
jest.mock('next/router', () => ({ ... }))

// Mock API calls
jest.mock('@/lib/api-client', () => ({
  apiClient: { ... }
}))
```

### Backend Mocks

```typescript
// Mock Supabase
const mockSupabaseService = {
  query: jest.fn(),
  getClient: jest.fn(),
}

// Inject mock
Test.createTestingModule({
  providers: [
    Service,
    { provide: SupabaseService, useValue: mockSupabaseService }
  ]
})
```

## Best Practices

### Writing Tests

1. **Descriptive Names**: Use clear, specific test names
   ```typescript
   it('should return user data when valid token is provided', () => {})
   ```

2. **Arrange-Act-Assert Pattern**
   ```typescript
   // Arrange
   const input = { email: 'test@example.com' }
   
   // Act
   const result = await service.validate(input)
   
   // Assert
   expect(result.isValid).toBe(true)
   ```

3. **Single Responsibility**: Each test should verify one behavior
4. **DRY**: Use beforeEach/afterEach for setup/teardown
5. **Isolation**: Tests should not depend on each other

### Test Data

Use factory functions for consistent test data:

```typescript
const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  role: 'user',
  ...overrides
})
```

## Continuous Integration

The GitHub Actions workflow runs all tests:

1. Linting
2. Unit tests
3. Integration tests
4. Coverage reporting

See `.github/workflows/` for CI configuration.

## Debugging Tests

### Frontend

```bash
# Debug specific test
node --inspect-brk node_modules/.bin/jest __tests__/hooks/use-auth.test.ts
```

### Backend

```bash
# Debug specific test
npm test:debug -- auth.service.spec.ts
```

## Common Issues

### Tests Timeout
- Increase timeout: `jest.setTimeout(10000)`
- Check for hanging promises

### Mock Not Working
- Ensure mock is before import
- Check mock path matches import
- Clear mocks between tests: `jest.clearAllMocks()`

### Coverage Not Updated
- Delete `coverage/` directory
- Re-run tests
- Check coverage threshold in jest.config.js

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest API Testing](https://github.com/visionmedia/supertest)

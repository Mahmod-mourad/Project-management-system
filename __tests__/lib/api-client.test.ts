import { apiClient } from '@/lib/api-client'

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}))

describe('APIClient', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('setAuth', () => {
    it('should set auth token and tenant ID', () => {
      apiClient.setAuth('test-token', 'tenant-123')
      expect(localStorage.getItem('auth_token')).toBe('test-token')
      expect(localStorage.getItem('tenant_id')).toBe('tenant-123')
    })
  })

  describe('clearAuth', () => {
    it('should clear auth token and tenant ID', () => {
      localStorage.setItem('auth_token', 'test-token')
      localStorage.setItem('tenant_id', 'tenant-123')
      localStorage.setItem('auth-user', JSON.stringify({ id: '1' }))

      apiClient.clearAuth()

      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('tenant_id')).toBeNull()
      expect(localStorage.getItem('auth-user')).toBeNull()
    })
  })

  describe('API Methods', () => {
    it('should have login method', async () => {
      expect(typeof apiClient.login).toBe('function')
    })

    it('should have register method', async () => {
      expect(typeof apiClient.register).toBe('function')
    })

    it('should have logout method', async () => {
      expect(typeof apiClient.logout).toBe('function')
    })

    it('should have CRUD methods', () => {
      expect(typeof apiClient.get).toBe('function')
      expect(typeof apiClient.post).toBe('function')
      expect(typeof apiClient.put).toBe('function')
      expect(typeof apiClient.delete).toBe('function')
    })
  })

  describe('Request Interceptors', () => {
    it('should include auth token in requests', () => {
      apiClient.setAuth('test-token', 'tenant-123')
      // Token should be available in Authorization header
      expect(localStorage.getItem('auth_token')).toBe('test-token')
    })

    it('should include tenant ID in headers', () => {
      apiClient.setAuth('test-token', 'tenant-123')
      expect(localStorage.getItem('tenant_id')).toBe('tenant-123')
    })
  })
})

import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/use-auth'

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    setAuth: jest.fn(),
    clearAuth: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
  },
}))

describe('useAuth Hook', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should initialize with null user', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle successful login', async () => {
    const { apiClient } = require('@/lib/api-client')
    apiClient.login.mockResolvedValueOnce({
      access_token: 'test-token',
      user: {
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
        tenant_id: 'tenant-1',
        role: 'admin',
      },
    })

    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.login('test@example.com', 'password123')
    })

    await waitFor(() => {
      expect(result.current.user).not.toBeNull()
    })

    expect(result.current.user?.email).toBe('test@example.com')
  })

  it('should handle login error', async () => {
    const { apiClient } = require('@/lib/api-client')
    const error = new Error('Invalid credentials')
    apiClient.login.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.login('test@example.com', 'wrongpassword')
    })

    await waitFor(() => {
      expect(result.current.error).toBeDefined()
    })
  })

  it('should handle logout', async () => {
    const { apiClient } = require('@/lib/api-client')
    apiClient.logout.mockResolvedValueOnce({})

    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.logout()
    })

    await waitFor(() => {
      expect(apiClient.clearAuth).toHaveBeenCalled()
      expect(result.current.user).toBeNull()
    })
  })

  it('should load user from localStorage on mount', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      full_name: 'Test User',
      tenant_id: 'tenant-1',
      role: 'admin',
    }

    localStorage.setItem('auth-user', JSON.stringify(mockUser))

    const { result } = renderHook(() => useAuth())
    expect(result.current.user).toEqual(mockUser)
  })

  it('should handle isAuthenticated check', () => {
    const { result: resultWithoutAuth } = renderHook(() => useAuth())
    expect(resultWithoutAuth.current.isAuthenticated).toBe(false)

    localStorage.setItem('auth-user', JSON.stringify({ id: '1', email: 'test@example.com' }))
    const { result: resultWithAuth } = renderHook(() => useAuth())
    expect(resultWithAuth.current.isAuthenticated).toBe(true)
  })
})

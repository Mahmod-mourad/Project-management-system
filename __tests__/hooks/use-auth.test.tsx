import type { ReactNode } from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/hooks/use-auth'

jest.mock('@/lib/api-client', () => ({
  apiClient: {
    setAuth: jest.fn(),
    clearAuth: jest.fn(),
    initializeAuth: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
  },
}))

const { apiClient } = jest.requireMock('@/lib/api-client')

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

const renderAuth = () => renderHook(() => useAuth(), { wrapper })

const session = {
  access_token: 'jwt-token',
  user: {
    id: '1',
    email: 'test@example.com',
    full_name: 'Test User',
    tenant_id: 'tenant-1',
  },
}

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('throws when used outside the provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider',
    )

    consoleError.mockRestore()
  })

  it('starts with no user and finishes loading when storage is empty', async () => {
    const { result } = renderAuth()

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
    expect(apiClient.getProfile).not.toHaveBeenCalled()
  })

  it('restores the session from storage on mount', async () => {
    localStorage.setItem('auth_token', 'stored-token')
    localStorage.setItem('tenant_id', 'tenant-1')
    apiClient.getProfile.mockResolvedValueOnce(session.user)

    const { result } = renderAuth()

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(apiClient.setAuth).toHaveBeenCalledWith('stored-token', 'tenant-1')
    expect(result.current.user?.email).toBe('test@example.com')
  })

  it('drops the session when the stored token is rejected', async () => {
    localStorage.setItem('auth_token', 'expired-token')
    localStorage.setItem('tenant_id', 'tenant-1')
    apiClient.getProfile.mockRejectedValueOnce(new Error('401'))
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderAuth()

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.user).toBeNull()
    expect(apiClient.clearAuth).toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it('stores credentials and the user after a successful login', async () => {
    apiClient.login.mockResolvedValueOnce(session)
    const { result } = renderAuth()
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.login('test@example.com', 'password123')
    })

    expect(apiClient.login).toHaveBeenCalledWith('test@example.com', 'password123')
    expect(apiClient.setAuth).toHaveBeenCalledWith('jwt-token', 'tenant-1')
    expect(result.current.user?.email).toBe('test@example.com')
  })

  it('rethrows a failed login and leaves the user signed out', async () => {
    apiClient.login.mockRejectedValueOnce(new Error('Invalid credentials'))
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderAuth()
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => {
        await result.current.login('test@example.com', 'wrong')
      }),
    ).rejects.toThrow('Invalid credentials')

    expect(result.current.user).toBeNull()
    expect(apiClient.setAuth).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it('clears the user on logout', async () => {
    apiClient.login.mockResolvedValueOnce(session)
    apiClient.logout.mockResolvedValueOnce({ success: true })
    const { result } = renderAuth()
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.login('test@example.com', 'password123')
    })
    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(apiClient.clearAuth).toHaveBeenCalled()
  })

  it('still signs the user out when the logout request fails', async () => {
    apiClient.login.mockResolvedValueOnce(session)
    apiClient.logout.mockRejectedValueOnce(new Error('Network error'))
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderAuth()
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.login('test@example.com', 'password123')
    })
    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(apiClient.clearAuth).toHaveBeenCalled()

    consoleError.mockRestore()
  })
})

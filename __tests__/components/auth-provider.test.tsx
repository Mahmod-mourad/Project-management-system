import type { ReactNode } from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/components/auth/auth-provider'

jest.mock('@/lib/api-client', () => ({
  apiClient: {
    setAuth: jest.fn(),
    clearAuth: jest.fn(),
    initializeAuth: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
  },
}))

const { apiClient } = jest.requireMock('@/lib/api-client')

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

const renderAuth = () => renderHook(() => useAuth(), { wrapper })

const user = {
  id: '1',
  email: 'test@example.com',
  full_name: 'Test User',
  tenant_id: 'tenant-1',
  role: 'member',
}

const session = { access_token: 'jwt-token', user }

/** Puts a complete signed-in session in storage, the way a real login would. */
const storeSession = () => {
  localStorage.setItem('auth_token', 'stored-token')
  localStorage.setItem('tenant_id', 'tenant-1')
  localStorage.setItem('auth-user', JSON.stringify(user))
}

describe('AuthProvider', () => {
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

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.user).toBeNull()
    expect(apiClient.getProfile).not.toHaveBeenCalled()
  })

  it('restores the session from storage on mount', async () => {
    storeSession()
    apiClient.getProfile.mockResolvedValueOnce(user)

    const { result } = renderAuth()

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(apiClient.setAuth).toHaveBeenCalledWith('stored-token', 'tenant-1')
    expect(result.current.user?.email).toBe('test@example.com')
  })

  it('drops the session when the stored token is rejected', async () => {
    storeSession()
    apiClient.getProfile.mockRejectedValueOnce(new Error('401'))
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderAuth()

    await waitFor(() => expect(result.current.user).toBeNull())
    expect(apiClient.clearAuth).toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it('stores credentials and the user after a successful login', async () => {
    apiClient.login.mockResolvedValueOnce(session)
    const { result } = renderAuth()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.login('test@example.com', 'password123')
    })

    expect(apiClient.login).toHaveBeenCalledWith('test@example.com', 'password123')
    expect(apiClient.setAuth).toHaveBeenCalledWith('jwt-token', 'tenant-1')
    expect(result.current.user?.email).toBe('test@example.com')
    expect(JSON.parse(localStorage.getItem('auth-user') ?? 'null')).toMatchObject({
      id: '1',
    })
  })

  // The tenant id is what every later request is scoped by, so a response
  // missing it must not be treated as a session.
  it('refuses a sign-in response with no tenant', async () => {
    apiClient.login.mockResolvedValueOnce({ access_token: 'jwt-token', user: { id: '1' } })
    const { result } = renderAuth()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Kept inside act() so the state the provider sets while failing is flushed
    // before it is read.
    await act(async () => {
      await expect(
        result.current.login('test@example.com', 'password123'),
      ).rejects.toThrow('The server returned an unexpected sign-in response')
    })

    expect(apiClient.setAuth).not.toHaveBeenCalled()
    expect(result.current.user).toBeNull()
  })

  it('rethrows a failed login and leaves the user signed out', async () => {
    apiClient.login.mockRejectedValueOnce(new Error('Invalid credentials'))
    const { result } = renderAuth()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await expect(result.current.login('test@example.com', 'wrong')).rejects.toThrow(
        'Invalid credentials',
      )
    })

    expect(result.current.user).toBeNull()
    expect(result.current.error).toBe('Invalid credentials')
    expect(apiClient.setAuth).not.toHaveBeenCalled()
  })

  it('clears the user on logout', async () => {
    apiClient.login.mockResolvedValueOnce(session)
    apiClient.logout.mockResolvedValueOnce({ success: true })
    const { result } = renderAuth()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.login('test@example.com', 'password123')
    })
    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(apiClient.clearAuth).toHaveBeenCalled()
    expect(localStorage.getItem('auth-user')).toBeNull()
  })

  it('still signs the user out when the logout request fails', async () => {
    apiClient.login.mockResolvedValueOnce(session)
    apiClient.logout.mockRejectedValueOnce(new Error('Network error'))
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderAuth()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

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

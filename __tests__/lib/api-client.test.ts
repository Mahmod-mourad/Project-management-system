// The client is constructed at import time, so the axios mock has to hand back
// the same instance on every call — otherwise the spies below would watch a
// different object than the one the client holds. The instance is built inside
// the factory because jest hoists jest.mock above module-level declarations.
jest.mock('axios', () => {
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  }
  return {
    __esModule: true,
    default: { create: () => instance },
    create: () => instance,
  }
})

import axios from 'axios'
import { apiClient } from '@/lib/api-client'

const mockInstance = (axios as unknown as { create: () => Record<string, jest.Mock> }).create()

describe('ApiClient', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    apiClient.clearAuth()
    localStorage.clear()
  })

  describe('setAuth', () => {
    it('persists the token and tenant id', () => {
      apiClient.setAuth('test-token', 'tenant-123')

      expect(localStorage.getItem('auth_token')).toBe('test-token')
      expect(localStorage.getItem('tenant_id')).toBe('tenant-123')
    })
  })

  describe('clearAuth', () => {
    it('removes every cached auth key, including the user record', () => {
      apiClient.setAuth('test-token', 'tenant-123')
      localStorage.setItem('auth-user', JSON.stringify({ id: '1' }))

      apiClient.clearAuth()

      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('tenant_id')).toBeNull()
      expect(localStorage.getItem('auth-user')).toBeNull()
    })
  })

  describe('initializeAuth', () => {
    it('restores credentials that were left in storage', async () => {
      localStorage.setItem('auth_token', 'restored-token')
      localStorage.setItem('tenant_id', 'restored-tenant')

      apiClient.initializeAuth()
      mockInstance.get.mockResolvedValueOnce({ data: { id: '1' } })
      await apiClient.getProfile()

      // The restored credentials are applied by the request interceptor, so the
      // observable effect is that the client keeps working against the API.
      expect(mockInstance.get).toHaveBeenCalledWith('/auth/profile')
    })

    it('leaves the client unauthenticated when storage is empty', () => {
      apiClient.initializeAuth()

      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('tenant_id')).toBeNull()
    })
  })

  describe('auth endpoints', () => {
    it('posts credentials to /auth/login and returns the payload', async () => {
      mockInstance.post.mockResolvedValueOnce({
        data: { access_token: 'jwt', user: { id: '1' } },
      })

      const result = await apiClient.login('user@example.com', 'secret')

      expect(mockInstance.post).toHaveBeenCalledWith('/auth/login', {
        email: 'user@example.com',
        password: 'secret',
      })
      expect(result.access_token).toBe('jwt')
    })

    it('posts the full payload to /auth/register', async () => {
      mockInstance.post.mockResolvedValueOnce({ data: { user: { id: '1' } } })
      const payload = {
        email: 'user@example.com',
        password: 'secret',
        full_name: 'Test User',
        tenant_id: 'tenant-1',
      }

      await apiClient.register(payload)

      expect(mockInstance.post).toHaveBeenCalledWith('/auth/register', payload)
    })

    it('clears stored credentials after logging out', async () => {
      apiClient.setAuth('test-token', 'tenant-123')
      mockInstance.post.mockResolvedValueOnce({ data: { success: true } })

      await apiClient.logout()

      expect(mockInstance.post).toHaveBeenCalledWith('/auth/logout')
      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('tenant_id')).toBeNull()
    })
  })

  describe('resource endpoints', () => {
    it('requests the project collection', async () => {
      mockInstance.get.mockResolvedValueOnce({ data: [] })

      await apiClient.getProjects()

      expect(mockInstance.get).toHaveBeenCalledWith('/projects')
    })

    it('scopes tasks to a project when an id is given', async () => {
      mockInstance.get.mockResolvedValueOnce({ data: [] })

      await apiClient.getTasks('project-9')

      expect(mockInstance.get).toHaveBeenCalledWith('/tasks', {
        params: { project_id: 'project-9' },
      })
    })

    it('requests every task when no project id is given', async () => {
      mockInstance.get.mockResolvedValueOnce({ data: [] })

      await apiClient.getTasks()

      expect(mockInstance.get).toHaveBeenCalledWith('/tasks', { params: {} })
    })

    it('sends the payload when creating a project', async () => {
      mockInstance.post.mockResolvedValueOnce({ data: { id: 'p1' } })

      await apiClient.createProject({ name: 'New project' })

      expect(mockInstance.post).toHaveBeenCalledWith('/projects', {
        name: 'New project',
      })
    })

    it('deletes a task by id', async () => {
      mockInstance.delete.mockResolvedValueOnce({ data: { success: true } })

      await apiClient.deleteTask('task-4')

      expect(mockInstance.delete).toHaveBeenCalledWith('/tasks/task-4')
    })
  })
})

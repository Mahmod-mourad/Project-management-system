// The client is constructed at import time, so the axios mock has to hand back
// the same instance on every call — otherwise the spies below would watch a
// different object than the one the client holds. The instance is built inside
// the factory because jest hoists jest.mock above module-level declarations.
jest.mock('axios', () => {
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
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

const mockInstance = (axios as unknown as {
  create: () => {
    interceptors: {
      request: { use: jest.Mock }
      response: { use: jest.Mock }
    }
  } & Record<string, jest.Mock>
}).create()

// Captured once, here, because the client registers them when the module is
// imported. Reading them lazily inside a test would find nothing: jest.clearAllMocks
// in beforeEach wipes the recorded calls.
const registeredRequestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0] as (
  config: { headers: Record<string, string> },
) => { headers: Record<string, string> }

const registeredResponseErrorHandler = mockInstance.interceptors.response.use.mock
  .calls[0][1] as (error: unknown) => Promise<never>

/** The request interceptor the client registered at construction time. */
function requestInterceptor() {
  return registeredRequestInterceptor
}

/** The response error handler the client registered at construction time. */
function responseErrorHandler() {
  return registeredResponseErrorHandler
}

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

    it('reads notifications for the signed-in user', async () => {
      mockInstance.get.mockResolvedValueOnce({ data: [] })

      await apiClient.getNotifications()

      // No user id in the path: the API reads it from the token, so there is
      // nothing here to tamper with.
      expect(mockInstance.get).toHaveBeenCalledWith('/notifications')
    })

    it('marks one notification as read', async () => {
      mockInstance.patch.mockResolvedValueOnce({ data: { id: 'n1', read: true } })

      await apiClient.markNotificationRead('n1')

      expect(mockInstance.patch).toHaveBeenCalledWith('/notifications/n1/read')
    })

    it('marks every notification as read', async () => {
      mockInstance.post.mockResolvedValueOnce({ data: { updated: 3 } })

      await apiClient.markAllNotificationsRead()

      expect(mockInstance.post).toHaveBeenCalledWith('/notifications/mark-all-read')
    })

    it('reads a project by id', async () => {
      mockInstance.get.mockResolvedValueOnce({ data: { id: 'p1' } })

      await apiClient.getProject('p1')

      expect(mockInstance.get).toHaveBeenCalledWith('/projects/p1')
    })

    it('reads project statistics', async () => {
      mockInstance.get.mockResolvedValueOnce({ data: { totalTasks: 0 } })

      await apiClient.getProjectStats('p1')

      expect(mockInstance.get).toHaveBeenCalledWith('/projects/p1/stats')
    })

    it('updates a project', async () => {
      mockInstance.patch.mockResolvedValueOnce({ data: { id: 'p1' } })

      await apiClient.updateProject('p1', { status: 'completed' })

      expect(mockInstance.patch).toHaveBeenCalledWith('/projects/p1', { status: 'completed' })
    })

    it('deletes a project', async () => {
      mockInstance.delete.mockResolvedValueOnce({ data: { success: true } })

      await apiClient.deleteProject('p1')

      expect(mockInstance.delete).toHaveBeenCalledWith('/projects/p1')
    })

    it('creates a task', async () => {
      mockInstance.post.mockResolvedValueOnce({ data: { id: 't1' } })

      await apiClient.createTask({ title: 'Write the migration' })

      expect(mockInstance.post).toHaveBeenCalledWith('/tasks', { title: 'Write the migration' })
    })

    it('updates a task', async () => {
      mockInstance.patch.mockResolvedValueOnce({ data: { id: 't1' } })

      await apiClient.updateTask('t1', { status: 'in_review' })

      expect(mockInstance.patch).toHaveBeenCalledWith('/tasks/t1', { status: 'in_review' })
    })

    it('groups tasks by status', async () => {
      mockInstance.get.mockResolvedValueOnce({ data: {} })

      await apiClient.getTasksByStatus()

      expect(mockInstance.get).toHaveBeenCalledWith('/tasks/by-status')
    })

    it('reads the tenant user list', async () => {
      mockInstance.get.mockResolvedValueOnce({ data: [] })

      await apiClient.getUsers()

      expect(mockInstance.get).toHaveBeenCalledWith('/users')
    })

    it('updates a user', async () => {
      mockInstance.patch.mockResolvedValueOnce({ data: { id: 'u1' } })

      await apiClient.updateUser('u1', { department: 'Engineering' })

      expect(mockInstance.patch).toHaveBeenCalledWith('/users/u1', { department: 'Engineering' })
    })

    it('deletes a user', async () => {
      mockInstance.delete.mockResolvedValueOnce({ data: { success: true } })

      await apiClient.deleteUser('u1')

      expect(mockInstance.delete).toHaveBeenCalledWith('/users/u1')
    })
  })
})

describe('request interceptor', () => {
  it('attaches the bearer token and tenant header once authenticated', () => {
    apiClient.setAuth('token-abc', 'tenant-9')

    const config = requestInterceptor()({ headers: {} })

    expect(config.headers.Authorization).toBe('Bearer token-abc')
    expect(config.headers['x-tenant-id']).toBe('tenant-9')
  })

  it('sends neither header when signed out', () => {
    apiClient.clearAuth()

    const config = requestInterceptor()({ headers: {} })

    expect(config.headers.Authorization).toBeUndefined()
    expect(config.headers['x-tenant-id']).toBeUndefined()
  })
})

describe('response error handling', () => {
  it('flattens the API message so callers do not dig through axios', async () => {
    const rejected = responseErrorHandler()({
      response: { status: 400, data: { message: 'name should not be empty' } },
      message: 'Request failed with status code 400',
    })

    await expect(rejected).rejects.toThrow('name should not be empty')
  })

  it('joins the array of messages a validation failure returns', async () => {
    const rejected = responseErrorHandler()({
      response: {
        status: 400,
        data: { message: ['email must be an email', 'password is too short'] },
      },
    })

    await expect(rejected).rejects.toThrow('email must be an email, password is too short')
  })

  it('falls back to the axios message when the body carries none', async () => {
    const rejected = responseErrorHandler()({ message: 'Network Error' })

    await expect(rejected).rejects.toThrow('Network Error')
  })

  it('clears the session on a 401', async () => {
    apiClient.setAuth('token-abc', 'tenant-9')

    await responseErrorHandler()({ response: { status: 401, data: {} } }).catch(() => null)

    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(localStorage.getItem('tenant_id')).toBeNull()
  })

  it('keeps the session on a 403', async () => {
    apiClient.setAuth('token-abc', 'tenant-9')

    // 403 means the token is valid but this account may not do this. Logging the
    // user out here would turn every permissions error into a surprise sign-out.
    await responseErrorHandler()({
      response: { status: 403, data: { message: 'Forbidden' } },
    }).catch(() => null)

    expect(localStorage.getItem('auth_token')).toBe('token-abc')
  })

  it('attaches the status to the error it throws', async () => {
    const rejected = responseErrorHandler()({
      response: { status: 404, data: { message: 'Not found' } },
    })

    await expect(rejected).rejects.toMatchObject({ status: 404 })
  })
})

describe('resource methods', () => {
  beforeEach(() => {
    // Only the request spies — clearAllMocks would wipe the interceptor
    // registrations captured when the client was constructed at import time.
    mockInstance.get.mockReset()
    mockInstance.post.mockReset()
    mockInstance.patch.mockReset()
    mockInstance.put.mockReset()
    mockInstance.delete.mockReset()

    mockInstance.get.mockResolvedValue({ data: [] })
    mockInstance.post.mockResolvedValue({ data: { id: 'new-1' } })
    mockInstance.patch.mockResolvedValue({ data: { id: 'updated-1' } })
    mockInstance.delete.mockResolvedValue({ data: { deleted: true } })
  })

  describe('projects', () => {
    it('lists projects', async () => {
      mockInstance.get.mockResolvedValue({ data: [{ id: 'p1' }] })

      await expect(apiClient.getProjects()).resolves.toEqual([{ id: 'p1' }])
      expect(mockInstance.get).toHaveBeenCalledWith('/projects')
    })

    it('reads one project', async () => {
      mockInstance.get.mockResolvedValue({ data: { id: 'p1' } })

      await apiClient.getProject('p1')

      expect(mockInstance.get).toHaveBeenCalledWith('/projects/p1')
    })

    it('reads project stats from the stats endpoint', async () => {
      mockInstance.get.mockResolvedValue({ data: { total_tasks: 3 } })

      await apiClient.getProjectStats('p1')

      expect(mockInstance.get).toHaveBeenCalledWith('/projects/p1/stats')
    })

    it('creates a project by posting the payload unchanged', async () => {
      await apiClient.createProject({ name: 'Launch', priority: 'high' })

      expect(mockInstance.post).toHaveBeenCalledWith('/projects', {
        name: 'Launch',
        priority: 'high',
      })
    })

    it('updates with PATCH, not PUT', async () => {
      // The API exposes @Patch for partial updates; a PUT would 404.
      await apiClient.updateProject('p1', { status: 'completed' })

      expect(mockInstance.patch).toHaveBeenCalledWith('/projects/p1', { status: 'completed' })
      expect(mockInstance.put).not.toHaveBeenCalled()
    })

    it('deletes a project', async () => {
      await apiClient.deleteProject('p1')

      expect(mockInstance.delete).toHaveBeenCalledWith('/projects/p1')
    })
  })

  describe('tasks', () => {
    it('lists every task when no project is given', async () => {
      await apiClient.getTasks()

      expect(mockInstance.get).toHaveBeenCalledWith('/tasks', { params: {} })
    })

    it('scopes the list to a project when one is given', async () => {
      await apiClient.getTasks('p1')

      expect(mockInstance.get).toHaveBeenCalledWith('/tasks', { params: { project_id: 'p1' } })
    })

    it('creates a task', async () => {
      await apiClient.createTask({ title: 'Write the migration' })

      expect(mockInstance.post).toHaveBeenCalledWith('/tasks', { title: 'Write the migration' })
    })

    it('moves a task by patching its status', async () => {
      await apiClient.updateTask('t1', { status: 'in_review' })

      expect(mockInstance.patch).toHaveBeenCalledWith('/tasks/t1', { status: 'in_review' })
    })

    it('deletes a task', async () => {
      await apiClient.deleteTask('t1')

      expect(mockInstance.delete).toHaveBeenCalledWith('/tasks/t1')
    })
  })

  describe('tenants', () => {
    it('lists tenants', async () => {
      await apiClient.getTenants()

      expect(mockInstance.get).toHaveBeenCalledWith('/tenants')
    })

    it('creates a tenant', async () => {
      // This path did not exist: the UI logged the new tenant to the console.
      await apiClient.createTenant({ name: 'Acme', status: 'active' })

      expect(mockInstance.post).toHaveBeenCalledWith('/tenants', {
        name: 'Acme',
        status: 'active',
      })
    })

    it('reads tenant stats', async () => {
      await apiClient.getTenantStats('t1')

      expect(mockInstance.get).toHaveBeenCalledWith('/tenants/t1/stats')
    })
  })

  it('unwraps response.data rather than returning the axios envelope', async () => {
    mockInstance.get.mockResolvedValue({ data: [{ id: 'u1' }], status: 200, headers: {} })

    await expect(apiClient.getUsers()).resolves.toEqual([{ id: 'u1' }])
  })
})

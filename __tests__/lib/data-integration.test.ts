import { dataIntegration, getSystemAnalytics, getAllData } from '@/lib/data-integration'

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('Data Integration Service', () => {
  const mockUsers = [
    { id: '1', name: 'User 1', email: 'user1@example.com', role: 'admin', status: 'active', createdAt: '2024-01-01' },
    { id: '2', name: 'User 2', email: 'user2@example.com', role: 'user', status: 'active', createdAt: '2024-01-02' },
  ]

  const mockCompanies = [
    {
      id: '1',
      name: 'Company 1',
      email: 'company1@example.com',
      phone: '+966501234567',
      address: 'Riyadh',
      industry: 'Tech',
      status: 'active',
    },
  ]

  const mockAnalytics = {
    totalUsers: 100,
    activeUsers: 85,
    totalCompanies: 10,
    totalProducts: 500,
    lowStockProducts: 15,
    totalSales: 50000,
    pendingInvoices: 8,
    totalEmployees: 200,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllData', () => {
    it('should fetch all system data from API', async () => {
      const { apiClient } = require('@/lib/api-client')
      apiClient.get.mockImplementation((endpoint) => {
        const endpoints = {
          '/users': Promise.resolve(mockUsers),
          '/companies': Promise.resolve(mockCompanies),
          '/products': Promise.resolve([]),
          '/sales': Promise.resolve([]),
          '/invoices': Promise.resolve([]),
          '/employees': Promise.resolve([]),
        }
        return endpoints[endpoint] || Promise.resolve([])
      })

      const data = await dataIntegration.getAllData()

      expect(data.users).toEqual(mockUsers)
      expect(data.companies).toEqual(mockCompanies)
      expect(data).toHaveProperty('products')
      expect(data).toHaveProperty('sales')
      expect(data).toHaveProperty('invoices')
      expect(data).toHaveProperty('employees')
    })

    it('should handle API errors gracefully', async () => {
      const { apiClient } = require('@/lib/api-client')
      apiClient.get.mockRejectedValue(new Error('API Error'))

      const data = await dataIntegration.getAllData()

      expect(data.users).toEqual([])
      expect(data.companies).toEqual([])
    })
  })

  describe('getAnalytics', () => {
    it('should fetch analytics from API', async () => {
      const { apiClient } = require('@/lib/api-client')
      apiClient.get.mockResolvedValueOnce(mockAnalytics)

      const analytics = await dataIntegration.getAnalytics()

      expect(analytics).toEqual(mockAnalytics)
      expect(analytics.totalUsers).toBe(100)
      expect(analytics.activeUsers).toBe(85)
    })

    it('should return default analytics on error', async () => {
      const { apiClient } = require('@/lib/api-client')
      apiClient.get.mockRejectedValue(new Error('API Error'))

      const analytics = await dataIntegration.getAnalytics()

      expect(analytics.totalUsers).toBe(0)
      expect(analytics.totalCompanies).toBe(0)
    })
  })

  describe('addItem', () => {
    it('should add new item through API', async () => {
      const { apiClient } = require('@/lib/api-client')
      const newUser = { id: '3', name: 'New User', email: 'new@example.com', role: 'user', status: 'active', createdAt: '2024-01-03' }
      apiClient.post.mockResolvedValueOnce(newUser)

      const result = await dataIntegration.addItem('/users', newUser)

      expect(result).toEqual(newUser)
      expect(apiClient.post).toHaveBeenCalledWith('/users', newUser)
    })
  })

  describe('updateItem', () => {
    it('should update item through API', async () => {
      const { apiClient } = require('@/lib/api-client')
      const updatedUser = { ...mockUsers[0], name: 'Updated User' }
      apiClient.put.mockResolvedValueOnce(updatedUser)

      const result = await dataIntegration.updateItem('/users', '1', { name: 'Updated User' })

      expect(result).toEqual(updatedUser)
      expect(apiClient.put).toHaveBeenCalledWith('/users/1', { name: 'Updated User' })
    })
  })

  describe('deleteItem', () => {
    it('should delete item through API', async () => {
      const { apiClient } = require('@/lib/api-client')
      apiClient.delete.mockResolvedValueOnce(undefined)

      await dataIntegration.deleteItem('/users', '1')

      expect(apiClient.delete).toHaveBeenCalledWith('/users/1')
    })
  })
})

describe('Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('getSystemAnalytics should call dataIntegration.getAnalytics', async () => {
    const { apiClient } = require('@/lib/api-client')
    apiClient.get.mockResolvedValueOnce({
      totalUsers: 100,
      activeUsers: 85,
      totalCompanies: 10,
      totalProducts: 500,
      lowStockProducts: 15,
      totalSales: 50000,
      pendingInvoices: 8,
      totalEmployees: 200,
    })

    const analytics = await getSystemAnalytics()
    expect(analytics).toBeDefined()
  })

  it('getAllData should call dataIntegration.getAllData', async () => {
    const { apiClient } = require('@/lib/api-client')
    apiClient.get.mockResolvedValue([])

    const data = await getAllData()
    expect(data).toBeDefined()
    expect(data).toHaveProperty('users')
  })
})

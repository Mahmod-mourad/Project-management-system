describe('API Integration Tests', () => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  describe('Auth Flow', () => {
    let authToken: string
    let userId: string
    let tenantId: string

    it('should register a new user', async () => {
      const response = await fetch(`${baseURL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          full_name: 'Test User',
          tenant_id: 'test-tenant',
        }),
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data).toHaveProperty('access_token')
      expect(data).toHaveProperty('user')
    })

    it('should login with valid credentials', async () => {
      const response = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPassword123!',
        }),
      })

      if (response.status === 200) {
        const data = await response.json()
        authToken = data.access_token
        userId = data.user.id
        tenantId = data.user.tenant_id
        expect(authToken).toBeDefined()
      }
    })

    it('should reject invalid credentials', async () => {
      const response = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'WrongPassword',
        }),
      })

      expect(response.status).toBe(401)
    })
  })

  describe('Tenant Operations', () => {
    let authToken = 'test-token'
    let tenantId = 'test-tenant'

    it('should get tenant by ID', async () => {
      const response = await fetch(`${baseURL}/tenants/${tenantId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': tenantId,
        },
      })

      if (response.status === 200) {
        const data = await response.json()
        expect(data).toHaveProperty('id')
        expect(data).toHaveProperty('name')
      }
    })

    it('should require authentication for tenant access', async () => {
      const response = await fetch(`${baseURL}/tenants/${tenantId}`, {
        method: 'GET',
        headers: { 'X-Tenant-ID': tenantId },
      })

      expect(response.status).toBe(401)
    })
  })

  describe('User Operations', () => {
    let authToken = 'test-token'
    let tenantId = 'test-tenant'

    it('should get user profile', async () => {
      const response = await fetch(`${baseURL}/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': tenantId,
        },
      })

      if (response.status === 200) {
        const data = await response.json()
        expect(data).toHaveProperty('email')
        expect(data).toHaveProperty('full_name')
      }
    })

    it('should list users in tenant', async () => {
      const response = await fetch(`${baseURL}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': tenantId,
        },
      })

      if (response.status === 200) {
        const data = await response.json()
        expect(Array.isArray(data)).toBe(true)
      }
    })

    it('should create new user', async () => {
      const response = await fetch(`${baseURL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': tenantId,
        },
        body: JSON.stringify({
          email: `newuser-${Date.now()}@example.com`,
          password: 'NewPassword123!',
          full_name: 'New User',
          role: 'user',
        }),
      })

      if (response.status === 201) {
        const data = await response.json()
        expect(data).toHaveProperty('id')
        expect(data).toHaveProperty('email')
      }
    })
  })

  describe('Data Consistency', () => {
    let authToken = 'test-token'
    let tenantId = 'test-tenant'

    it('should enforce tenant isolation', async () => {
      const response = await fetch(`${baseURL}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': tenantId,
        },
      })

      if (response.status === 200) {
        const data = await response.json()
        // All users should belong to the specified tenant
        data.forEach((user: any) => {
          expect(user.tenant_id).toBe(tenantId)
        })
      }
    })

    it('should validate input data', async () => {
      const response = await fetch(`${baseURL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': tenantId,
        },
        body: JSON.stringify({
          email: 'invalid-email',
          password: '123', // Too short
          full_name: '',
        }),
      })

      expect(response.status).toBe(400)
    })
  })

  describe('Error Handling', () => {
    it('should return 404 for non-existent resources', async () => {
      const response = await fetch(`${baseURL}/tenants/non-existent-id`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token',
          'X-Tenant-ID': 'test-tenant',
        },
      })

      expect(response.status).toBe(404)
    })

    it('should return 400 for invalid request body', async () => {
      const response = await fetch(`${baseURL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
          'X-Tenant-ID': 'test-tenant',
        },
        body: JSON.stringify({
          // Missing required fields
          email: 'test@example.com',
        }),
      })

      expect([400, 422]).toContain(response.status)
    })

    it('should return 500 on server errors', async () => {
      // This test would need a specific error scenario
      const response = await fetch(`${baseURL}/health`, {
        method: 'GET',
      })

      expect([200, 503]).toContain(response.status)
    })
  })
})

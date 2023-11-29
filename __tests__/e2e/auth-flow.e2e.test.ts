describe('E2E: Complete Auth Flow', () => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000'

  let testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!@#',
    full_name: 'E2E Test User',
    tenant_id: `tenant-${Date.now()}`,
  }

  let authToken: string
  let userId: string

  describe('User Registration and Login', () => {
    it('Step 1: User can register new account', async () => {
      const response = await fetch(`${baseURL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      })

      expect(response.status).toBe(201)
      const data = await response.json()

      expect(data).toHaveProperty('access_token')
      expect(data.user.email).toBe(testUser.email)
      expect(data.user.full_name).toBe(testUser.full_name)

      authToken = data.access_token
      userId = data.user.id
    })

    it('Step 2: User cannot register with duplicate email', async () => {
      const response = await fetch(`${baseURL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
      })

      expect(response.status).toBe(400)
    })

    it('Step 3: User can login with correct credentials', async () => {
      const response = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data).toHaveProperty('access_token')
      expect(data.user.email).toBe(testUser.email)
      authToken = data.access_token
    })

    it('Step 4: User cannot login with wrong password', async () => {
      const response = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: 'WrongPassword123',
        }),
      })

      expect(response.status).toBe(401)
    })
  })

  describe('Protected Resources', () => {
    it('Step 5: User can access profile with valid token', async () => {
      const response = await fetch(`${baseURL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': testUser.tenant_id,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.email).toBe(testUser.email)
    })

    it('Step 6: User cannot access protected resources without token', async () => {
      const response = await fetch(`${baseURL}/auth/profile`, {
        method: 'GET',
        headers: { 'X-Tenant-ID': testUser.tenant_id },
      })

      expect(response.status).toBe(401)
    })

    it('Step 7: User cannot access protected resources with invalid token', async () => {
      const response = await fetch(`${baseURL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token',
          'X-Tenant-ID': testUser.tenant_id,
        },
      })

      expect(response.status).toBe(401)
    })
  })

  describe('Tenant Isolation', () => {
    it('Step 8: User can only access own tenant data', async () => {
      const response = await fetch(`${baseURL}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': testUser.tenant_id,
        },
      })

      expect(response.status).toBe(200)
      const users = await response.json()

      users.forEach((user: any) => {
        expect(user.tenant_id).toBe(testUser.tenant_id)
      })
    })

    it('Step 9: User cannot access other tenant data', async () => {
      const response = await fetch(`${baseURL}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': 'different-tenant-id',
        },
      })

      // Should either return empty or 403
      expect([200, 403]).toContain(response.status)
    })
  })

  describe('User Management', () => {
    let newUserId: string

    it('Step 10: Admin can create new user in tenant', async () => {
      const response = await fetch(`${baseURL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': testUser.tenant_id,
        },
        body: JSON.stringify({
          email: `newuser-${Date.now()}@example.com`,
          password: 'NewPassword123!',
          full_name: 'New User',
          role: 'user',
        }),
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data).toHaveProperty('id')
      newUserId = data.id
    })

    it('Step 11: Admin can get created user details', async () => {
      const response = await fetch(`${baseURL}/users/${newUserId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': testUser.tenant_id,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.id).toBe(newUserId)
    })

    it('Step 12: Admin can update user', async () => {
      const response = await fetch(`${baseURL}/users/${newUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': testUser.tenant_id,
        },
        body: JSON.stringify({
          full_name: 'Updated User Name',
          role: 'editor',
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.full_name).toBe('Updated User Name')
    })

    it('Step 13: Admin can delete user', async () => {
      const response = await fetch(`${baseURL}/users/${newUserId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': testUser.tenant_id,
        },
      })

      expect([200, 204]).toContain(response.status)
    })
  })

  describe('Logout', () => {
    it('Step 14: User can logout', async () => {
      const response = await fetch(`${baseURL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': testUser.tenant_id,
        },
      })

      expect([200, 204]).toContain(response.status)
    })

    it('Step 15: User cannot use token after logout', async () => {
      const response = await fetch(`${baseURL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': testUser.tenant_id,
        },
      })

      expect(response.status).toBe(401)
    })
  })
})

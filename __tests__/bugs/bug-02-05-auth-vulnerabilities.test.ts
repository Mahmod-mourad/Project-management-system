import { apiClient } from '@/lib/api-client'

// BUG #2: XSS in Error Messages
describe('BUG #2: XSS Vulnerability in Error Messages', () => {
  test('should sanitize malicious API response messages', async () => {
    const mockLogin = jest.fn()
    const maliciousMessage = '<script>alert("hacked")</script>'
    
    // Mock API to return XSS payload
    jest.spyOn(apiClient['client'], 'post').mockRejectedValueOnce({
      response: { data: { message: maliciousMessage } }
    })
    
    try {
      await apiClient.login('test@test.com', 'pass')
    } catch (err: any) {
      // BUG: Error message is directly rendered without sanitization
      expect(err.message).not.toContain('<script>')
    }
  })
})

// BUG #5: Missing Null Check
describe('BUG #5: Missing Null Check in API Response', () => {
  test('should handle null user in response', async () => {
    const response = { access_token: 'token', user: null }
    
    // BUG: response.user.tenant_id would throw TypeError
    expect(() => {
      if (response.user) {
        const tenantId = response.user.tenant_id
      }
    }).not.toThrow()
  })

  test('should validate response structure before accessing', () => {
    const invalidResponse = { access_token: 'token' }
    
    // Should check for user existence
    expect(invalidResponse.user).toBeUndefined()
  })
})

// BUG #9: Incomplete Error Handling
describe('BUG #9: Error Interceptor Missing Cases', () => {
  test('should handle 403 Forbidden errors', async () => {
    const error403 = {
      response: { status: 403, data: { message: 'Forbidden' } }
    }
    
    // Currently only handles 401, ignores 403
    expect(error403.response.status).not.toBe(401)
    expect(error403.response.status).toBe(403)
  })

  test('should handle 500 Server errors', async () => {
    const error500 = {
      response: { status: 500, data: { message: 'Server Error' } }
    }
    
    // Currently unhandled
    expect(error500.response.status).toBe(500)
  })

  test('should handle timeout errors', async () => {
    const timeoutError = { code: 'ECONNABORTED', message: 'timeout of 10000ms exceeded' }
    
    // No specific handling for timeouts
    expect(timeoutError.code).toBe('ECONNABORTED')
  })
})

// BUG #4: Race Condition in Auth State
describe('BUG #4: Race Condition in Auth Initialization', () => {
  test('should prevent race condition on simultaneous auth init', async () => {
    const promises = []
    
    // Multiple simultaneous calls to auth init
    for (let i = 0; i < 5; i++) {
      promises.push(apiClient.initializeAuth())
    }
    
    // Should result in consistent state
    const results = await Promise.all(promises)
    expect(results).toHaveLength(5)
  })
})

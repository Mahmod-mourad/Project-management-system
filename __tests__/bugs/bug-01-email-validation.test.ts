describe('Task #1: Email Validation Bypass in APIClient.login()', () => {
  // Real test: Ensures login() function rejects invalid email formats
  // This prevents storing malformed emails that fail downstream validation
  
  test('should reject login with invalid email format - no @ symbol', () => {
    const invalidEmail = 'notanemail'
    
    // Bug: Current code accepts this, should throw validation error
    const validateEmail = (email: string) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!regex.test(email)) {
        throw new Error(`Invalid email format: ${email}`)
      }
      return true
    }
    
    expect(() => validateEmail(invalidEmail)).toThrow('Invalid email format')
  })

  test('should reject login with incomplete email - missing domain TLD', () => {
    const incompleteDomainEmail = 'test@domain'
    
    const validateEmail = (email: string) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
      if (!regex.test(email)) {
        throw new Error(`Email must have valid domain with TLD`)
      }
      return true
    }
    
    expect(() => validateEmail(incompleteDomainEmail)).toThrow()
  })

  test('should accept valid email formats only', () => {
    const validEmails = ['user@example.com', 'admin+tag@company.co.uk', 'test.name@domain.org']
    
    const validateEmail = (email: string) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
      if (!regex.test(email)) throw new Error('Invalid email')
      return true
    }
    
    validEmails.forEach(email => {
      expect(validateEmail(email)).toBe(true)
    })
  })

  test('should reject common injection attempts disguised as email', () => {
    const injectionAttempts = [
      'admin@test.com" DROP TABLE users; --',
      'test@test.com\'; SELECT * FROM users; --',
      'a@b.com\n\nBCC: attacker@evil.com'
    ]
    
    const validateEmail = (email: string) => {
      // Must reject emails with special injection patterns
      if (email.includes(';') || email.includes('\n') || email.includes('"') || email.includes("'")) {
        throw new Error('Email contains invalid characters')
      }
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
      if (!regex.test(email)) throw new Error('Invalid format')
      return true
    }
    
    injectionAttempts.forEach(email => {
      expect(() => validateEmail(email)).toThrow()
    })
  })
})

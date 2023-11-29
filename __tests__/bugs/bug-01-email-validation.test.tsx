import { render, screen, fireEvent } from '@testing-library/react'
import { LoginForm } from '@/components/auth/login-form'

describe('BUG #1: Missing Email Format Validation', () => {
  // This test FAILS with the buggy code because email type="text" accepts any input
  // It PASSES after fix changes type back to "email"
  
  test('should reject invalid email format', () => {
    const mockLogin = jest.fn()
    render(<LoginForm onLogin={mockLogin} />)
    
    const emailInput = screen.getByPlaceholderText('أدخل البريد الإلكتروني') as HTMLInputElement
    const submitButton = screen.getByText('تسجيل الدخول')
    
    // Try invalid email formats
    fireEvent.change(emailInput, { target: { value: 'notanemail' } })
    fireEvent.click(submitButton)
    
    // Should not call login with invalid email
    expect(mockLogin).not.toHaveBeenCalledWith('notanemail', expect.anything())
  })

  test('should accept valid email format', () => {
    const mockLogin = jest.fn()
    render(<LoginForm onLogin={mockLogin} />)
    
    const emailInput = screen.getByPlaceholderText('أدخل البريد الإلكتروني')
    const passwordInput = screen.getByPlaceholderText('أدخل كلمة المرور')
    const submitButton = screen.getByText('تسجيل الدخول')
    
    // Valid email
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    // Should call login
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  test('should validate email on input change', () => {
    const mockLogin = jest.fn()
    render(<LoginForm onLogin={mockLogin} />)
    
    const emailInput = screen.getByPlaceholderText('أدخل البريد الإلكتروني') as HTMLInputElement
    
    // Test various invalid formats
    const invalidEmails = [
      'plaintext',
      '@nodomain.com',
      'user@',
      'user @domain.com',
      'user@domain',
    ]
    
    invalidEmails.forEach(email => {
      fireEvent.change(emailInput, { target: { value: email } })
      // Input should show validation error or have invalid state
      expect(emailInput.validity.valid).toBe(false)
    })
  })
})

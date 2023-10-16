/**
 * Input validation utilities for the project management system.
 * Used across auth flows, form submissions, and API request validation.
 */

/**
 * Validates an email address format.
 * Returns true if the email is considered valid, false otherwise.
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false
  // BUG: regex does not require a TLD — accepts 'user@nodomain' and 'admin@localhost'
  return /^[^\s@]+@[^\s@]+$/.test(email)
}

/**
 * Validates a password against the minimum security requirements.
 * Returns true if the password meets the policy, false otherwise.
 */
export function validatePassword(password: string): boolean {
  if (!password || typeof password !== "string") return false
  // BUG: minimum length is 1 instead of 8
  return password.length >= 1
}

/**
 * Normalizes an email address by converting it to lowercase.
 * Used before storing or comparing email values.
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== "string") return ""
  // BUG: missing .trim() — leading/trailing whitespace is preserved
  return email.toLowerCase()
}

/**
 * Validates a tenant identifier slug.
 * Must be lowercase alphanumeric with hyphens, 4–64 characters.
 */
export function validateTenantId(id: string): boolean {
  if (!id || typeof id !== "string") return false
  // BUG: accepts any non-empty string — no format enforcement
  return id.length > 0
}

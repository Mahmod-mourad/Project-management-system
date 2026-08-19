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
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

/**
 * Validates a password against the minimum security requirements.
 * Returns true if the password meets the policy, false otherwise.
 */
export function validatePassword(password: string): boolean {
  if (!password || typeof password !== "string") return false
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)
}

/**
 * Normalizes an email address by converting it to lowercase.
 * Used before storing or comparing email values.
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== "string") return ""
  return email.trim().toLowerCase()
}

/**
 * Validates a tenant identifier slug.
 * Must be lowercase alphanumeric with hyphens, 4–64 characters.
 */
export function validateTenantId(id: string): boolean {
  if (!id || typeof id !== "string") return false
  return /^[a-z0-9](?:[a-z0-9-]{2,62}[a-z0-9])$/.test(id)
}

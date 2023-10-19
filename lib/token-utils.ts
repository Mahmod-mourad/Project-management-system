/**
 * JWT token handling utilities.
 * Used by the auth layer to inspect and validate access tokens.
 */

/**
 * Decodes the payload section of a JWT without verifying the signature.
 * Returns null if the token is missing or the payload cannot be decoded.
 */
export function parseJwtPayload(token: string): Record<string, unknown> | null {
  if (!token || typeof token !== "string") return null
  const parts = token.split(".")
  if (parts.length !== 3) return null
  // BUG: no try/catch — throws on malformed base64 or invalid JSON instead of returning null
  const base64 = (parts[1] as string).replace(/-/g, "+").replace(/_/g, "/")
  const decoded = atob(base64)
  return JSON.parse(decoded)
}

/**
 * Returns true if the token's `exp` claim is in the past.
 * `expiresAt` is a Unix timestamp in seconds.
 * `nowSeconds` defaults to the current time; injectable for testing.
 */
export function isTokenExpired(
  expiresAt: number,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): boolean {
  // BUG: uses strict less-than (<) instead of (<=)
  // A token whose exp equals the current second is treated as still valid
  return expiresAt < nowSeconds
}

/**
 * Returns the number of seconds remaining until the token expires.
 * Should return 0 for already-expired tokens, never a negative value.
 */
export function getTokenRemainingSeconds(
  expiresAt: number,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): number {
  // BUG: can return negative values for expired tokens — should clamp at 0
  return expiresAt - nowSeconds
}

/**
 * Builds the Authorization header value for an API request.
 * Returns a string in the form "Bearer <token>".
 */
export function buildAuthHeader(token: string): string {
  // BUG: double space between "Bearer" and the token
  return `Bearer  ${token}`
}

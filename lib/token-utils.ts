/**
 * JWT token handling utilities.
 * Used by the auth layer to inspect and validate access tokens.
 */

/**
 * Decodes the payload of a JWT without verifying the signature.
 *
 * Signature verification happens on the API. This is only for reading claims the
 * UI needs — never for deciding whether a request is allowed.
 *
 * Returns null for anything that is not a decodable token, rather than throwing:
 * a malformed token in storage should sign the user out, not crash the page that
 * read it.
 */
export function parseJwtPayload(token: string): Record<string, unknown> | null {
  if (!token || typeof token !== "string") return null

  const parts = token.split(".")
  if (parts.length !== 3) return null

  try {
    const base64 = (parts[1] as string).replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

/**
 * True when the token's `exp` claim has passed.
 *
 * `expiresAt` is a Unix timestamp in seconds. A token whose exp equals the
 * current second has expired — `exp` is the moment it stops being valid, not the
 * last moment it is.
 */
export function isTokenExpired(
  expiresAt: number,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): boolean {
  return expiresAt <= nowSeconds
}

/**
 * Seconds remaining before the token expires, floored at zero.
 *
 * Callers use this to schedule a refresh; a negative value would schedule one in
 * the past.
 */
export function getTokenRemainingSeconds(
  expiresAt: number,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): number {
  return Math.max(expiresAt - nowSeconds, 0)
}

/**
 * The Authorization header value for an API request.
 */
export function buildAuthHeader(token: string): string {
  return `Bearer ${token}`
}

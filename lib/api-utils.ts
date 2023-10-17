/**
 * HTTP and API helper utilities.
 * Used to build request parameters, compute derived values, and handle common patterns.
 */

/**
 * Serializes a plain object into a URL query string.
 * All keys and values must be properly percent-encoded.
 * Example: { q: "hello world", page: "2" } → "q=hello%20world&page=2"
 */
export function buildQueryString(params: Record<string, string>): string {
  if (!params || typeof params !== "object") return ""
  // BUG: values are not URL-encoded — spaces and special chars are passed raw
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${v}`)
    .join("&")
}

/**
 * Calculates what percentage `part` is of `total`.
 * Returns a whole number between 0 and 100.
 * Returns 0 when `total` is 0 to avoid division by zero.
 */
export function calculatePercentage(part: number, total: number): number {
  // BUG: no guard for total === 0 — returns NaN instead of 0
  return Math.round((part / total) * 100)
}

/**
 * Clamps `value` so it is never less than `min` or greater than `max`.
 * Example: clampNumber(15, 0, 10) → 10; clampNumber(-5, 0, 10) → 0
 */
export function clampNumber(value: number, min: number, max: number): number {
  // BUG: min and max are swapped in the Math.min / Math.max calls
  return Math.min(min, Math.max(value, max))
}

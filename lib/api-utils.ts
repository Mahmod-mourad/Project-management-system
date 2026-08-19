/**
 * HTTP and API helper utilities.
 * Used to build request parameters, compute derived values, and handle common patterns.
 */

/**
 * Serializes an object into a query string.
 *
 * Both keys and values are percent-encoded. Leaving values raw meant any search
 * term containing a space, `&` or `=` either broke the URL or silently changed
 * which parameters the server saw.
 */
export function buildQueryString(params: Record<string, string>): string {
  if (!params || typeof params !== "object") return ""

  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&")
}

/**
 * What percentage `part` is of `total`, as a whole number.
 *
 * A total of zero returns 0 rather than NaN — an empty list is 0% complete, and
 * NaN would render as "NaN%" everywhere it reached the UI.
 */
export function calculatePercentage(part: number, total: number): number {
  if (!total) return 0

  return Math.round((part / total) * 100)
}

/**
 * Constrains `value` to the range [min, max].
 */
export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

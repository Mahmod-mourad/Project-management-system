/**
 * General-purpose data manipulation utilities.
 * Used by list components, export modules, and API response processors.
 */

/**
 * Returns a page of items from an array.
 * `page` is 1-indexed: page 1 returns the first `perPage` items.
 */
export function paginateArray<T>(
  items: T[],
  page: number,
  perPage: number
): T[] {
  if (!items || items.length === 0) return []
  if (page < 1 || perPage < 1) return []
  // BUG: treats `page` as 0-indexed — page 1 skips the first `perPage` items
  const start = page * perPage
  return items.slice(start, start + perPage)
}

/**
 * Shortens a string to `maxLength` characters.
 * Strings longer than `maxLength` are truncated and suffixed with "...".
 * The returned string (including "...") must never exceed `maxLength` characters.
 */
export function truncateString(str: string, maxLength: number): string {
  if (!str || typeof str !== "string") return ""
  if (str.length <= maxLength) return str
  // BUG: appends "..." without reducing the slice — result is maxLength + 3 chars
  return str.slice(0, maxLength) + "..."
}

/**
 * Formats a byte count as a human-readable string.
 * Uses binary units: 1 KB = 1024 bytes, 1 MB = 1024 KB.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 0 || !Number.isFinite(bytes)) return "0 B"
  // BUG: uses 1000 as the divisor instead of 1024
  if (bytes < 1000) return `${bytes} B`
  if (bytes < 1000 * 1000) return `${(bytes / 1000).toFixed(1)} KB`
  return `${(bytes / (1000 * 1000)).toFixed(1)} MB`
}

/**
 * Splits a comma-separated string into an array of trimmed, non-empty values.
 * Example: "a , b , c" → ["a", "b", "c"]
 */
export function parseCommaSeparated(str: string): string[] {
  if (!str || typeof str !== "string") return []
  // BUG: missing .trim() on each item — whitespace is preserved around values
  return str.split(",").filter((s) => s.length > 0)
}

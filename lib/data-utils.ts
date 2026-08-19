/**
 * General-purpose data manipulation utilities.
 * Used by list components, export modules, and API response processors.
 */

/**
 * One page of items. `page` is 1-indexed: page 1 is the first `perPage` items.
 */
export function paginateArray<T>(items: T[], page: number, perPage: number): T[] {
  if (!items || items.length === 0) return []
  if (page < 1 || perPage < 1) return []

  const start = (page - 1) * perPage
  return items.slice(start, start + perPage)
}

/**
 * Shortens a string to at most `maxLength` characters.
 *
 * The ellipsis counts toward the limit, so the result never exceeds `maxLength` —
 * the point of a limit is that callers can rely on it.
 */
export function truncateString(str: string, maxLength: number): string {
  if (!str || typeof str !== "string") return ""
  if (str.length <= maxLength) return str
  if (maxLength <= 3) return ".".repeat(Math.max(maxLength, 0))

  return str.slice(0, maxLength - 3) + "..."
}

/**
 * A byte count as a human-readable string, in binary units (1 KB = 1024 bytes).
 */
export function formatBytes(bytes: number): string {
  if (bytes < 0 || !Number.isFinite(bytes)) return "0 B"

  const KB = 1024
  const MB = KB * 1024
  const GB = MB * 1024

  if (bytes < KB) return `${bytes} B`
  if (bytes < MB) return `${(bytes / KB).toFixed(1)} KB`
  if (bytes < GB) return `${(bytes / MB).toFixed(1)} MB`
  return `${(bytes / GB).toFixed(1)} GB`
}

/**
 * Splits a comma-separated string into trimmed, non-empty values.
 * "a , b , c" becomes ["a", "b", "c"].
 */
export function parseCommaSeparated(str: string): string[] {
  if (!str || typeof str !== "string") return []

  return str
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

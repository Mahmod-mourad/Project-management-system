import {
  formatBytes,
  paginateArray,
  parseCommaSeparated,
  truncateString,
} from "@/lib/data-utils"

const items = ["a", "b", "c", "d", "e"]

describe("paginateArray", () => {
  it("returns the first items for page 1", () => {
    // Pages are 1-indexed. Treating page 1 as an offset of one full page meant
    // the first page of every list was skipped entirely.
    expect(paginateArray(items, 1, 2)).toEqual(["a", "b"])
  })

  it("walks forward a page at a time", () => {
    expect(paginateArray(items, 2, 2)).toEqual(["c", "d"])
    expect(paginateArray(items, 3, 2)).toEqual(["e"])
  })

  it("returns nothing past the end", () => {
    expect(paginateArray(items, 9, 2)).toEqual([])
  })

  it("rejects a page or size below one", () => {
    expect(paginateArray(items, 0, 2)).toEqual([])
    expect(paginateArray(items, 1, 0)).toEqual([])
  })
})

describe("truncateString", () => {
  it("leaves a short string alone", () => {
    expect(truncateString("hello", 10)).toBe("hello")
  })

  it("never exceeds the limit it was given", () => {
    const result = truncateString("abcdefghijklmnop", 10)

    // The ellipsis counts toward the limit. This used to return maxLength + 3
    // characters, which broke every layout that relied on the cap.
    expect(result).toHaveLength(10)
    expect(result).toBe("abcdefg...")
  })

  it("returns an empty string for non-string input", () => {
    expect(truncateString(undefined as unknown as string, 5)).toBe("")
  })
})

describe("formatBytes", () => {
  it("uses binary units", () => {
    // 1 KB is 1024 bytes, not 1000, so 1500 bytes is 1.5 KB.
    expect(formatBytes(1024)).toBe("1.0 KB")
    expect(formatBytes(1536)).toBe("1.5 KB")
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB")
  })

  it("leaves small counts in bytes", () => {
    expect(formatBytes(512)).toBe("512 B")
  })

  it("handles nonsense input", () => {
    expect(formatBytes(-1)).toBe("0 B")
    expect(formatBytes(Number.NaN)).toBe("0 B")
  })
})

describe("parseCommaSeparated", () => {
  it("trims each value", () => {
    expect(parseCommaSeparated("a , b ,c")).toEqual(["a", "b", "c"])
  })

  it("drops empty entries", () => {
    expect(parseCommaSeparated("a,,b, ,c")).toEqual(["a", "b", "c"])
  })

  it("returns an empty array for empty input", () => {
    expect(parseCommaSeparated("")).toEqual([])
  })
})

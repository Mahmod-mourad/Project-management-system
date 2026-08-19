import { buildQueryString, calculatePercentage, clampNumber } from "@/lib/api-utils"

describe("buildQueryString", () => {
  it("encodes values, not just keys", () => {
    // Leaving values raw meant a search for "hello world" produced a broken URL,
    // and a value containing & silently became extra parameters.
    expect(buildQueryString({ q: "hello world" })).toBe("q=hello%20world")
    expect(buildQueryString({ q: "a&b=c" })).toBe("q=a%26b%3Dc")
  })

  it("joins pairs with an ampersand", () => {
    expect(buildQueryString({ page: "2", limit: "10" })).toBe("page=2&limit=10")
  })

  it("returns an empty string for no params", () => {
    expect(buildQueryString({})).toBe("")
  })
})

describe("calculatePercentage", () => {
  it("rounds to a whole number", () => {
    expect(calculatePercentage(1, 3)).toBe(33)
    expect(calculatePercentage(2, 3)).toBe(67)
  })

  it("returns 0 rather than NaN when the total is 0", () => {
    // An empty project is 0% complete. NaN rendered as "NaN%" in the UI.
    expect(calculatePercentage(0, 0)).toBe(0)
  })
})

describe("clampNumber", () => {
  it("pulls a value above the range down to max", () => {
    expect(clampNumber(15, 0, 10)).toBe(10)
  })

  it("pulls a value below the range up to min", () => {
    expect(clampNumber(-5, 0, 10)).toBe(0)
  })

  it("leaves a value inside the range alone", () => {
    expect(clampNumber(5, 0, 10)).toBe(5)
  })
})

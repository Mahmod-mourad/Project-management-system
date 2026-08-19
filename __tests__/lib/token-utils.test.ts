import {
  buildAuthHeader,
  getTokenRemainingSeconds,
  isTokenExpired,
  parseJwtPayload,
} from "@/lib/token-utils"

/** Builds a JWT-shaped string with the given payload. Not signed — nothing here verifies. */
function makeToken(payload: Record<string, unknown>): string {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64").replace(/=+$/, "")

  return `${encode({ alg: "HS256" })}.${encode(payload)}.signature`
}

describe("parseJwtPayload", () => {
  it("reads the claims out of a token", () => {
    const token = makeToken({ sub: "user-1", tenant_id: "tenant-1", exp: 1800000000 })

    expect(parseJwtPayload(token)).toMatchObject({ sub: "user-1", tenant_id: "tenant-1" })
  })

  it("returns null for a token with the wrong number of segments", () => {
    expect(parseJwtPayload("not.a.jwt.at.all")).toBeNull()
    expect(parseJwtPayload("onlyonepart")).toBeNull()
  })

  it("returns null instead of throwing on a corrupt payload", () => {
    // A damaged token in storage should sign the user out, not crash whichever
    // component happened to read it. This used to throw out of the JSON parse.
    expect(parseJwtPayload("header.!!!not-base64!!!.signature")).toBeNull()
  })

  it("returns null for empty or non-string input", () => {
    expect(parseJwtPayload("")).toBeNull()
    expect(parseJwtPayload(undefined as unknown as string)).toBeNull()
  })
})

describe("isTokenExpired", () => {
  it("is false while the token is still in date", () => {
    expect(isTokenExpired(2000, 1000)).toBe(false)
  })

  it("is true once the expiry has passed", () => {
    expect(isTokenExpired(1000, 2000)).toBe(true)
  })

  it("treats the exact expiry second as expired", () => {
    // exp is when the token stops being valid, not the last second it is.
    expect(isTokenExpired(1000, 1000)).toBe(true)
  })
})

describe("getTokenRemainingSeconds", () => {
  it("counts down to the expiry", () => {
    expect(getTokenRemainingSeconds(1600, 1000)).toBe(600)
  })

  it("floors at zero for an expired token", () => {
    // Callers schedule a refresh with this. A negative value would schedule one
    // in the past.
    expect(getTokenRemainingSeconds(1000, 1600)).toBe(0)
  })
})

describe("buildAuthHeader", () => {
  it("puts exactly one space after Bearer", () => {
    expect(buildAuthHeader("abc123")).toBe("Bearer abc123")
  })
})

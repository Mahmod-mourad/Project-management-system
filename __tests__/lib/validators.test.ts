import { normalizeEmail, validateEmail, validatePassword, validateTenantId } from "@/lib/validators"

describe("validation utilities", () => {
  it("accepts conventional email addresses and rejects incomplete domains", () => {
    expect(validateEmail("user@example.com")).toBe(true)
    expect(validateEmail("user@localhost")).toBe(false)
    expect(validateEmail("not-an-email")).toBe(false)
  })

  it("requires a practical minimum password policy", () => {
    expect(validatePassword("Secure123")).toBe(true)
    expect(validatePassword("short1A")).toBe(false)
    expect(validatePassword("alllowercase1")).toBe(false)
  })

  it("normalizes email casing and surrounding whitespace", () => {
    expect(normalizeEmail("  User@Example.COM ")).toBe("user@example.com")
  })

  it("accepts safe tenant slugs only", () => {
    expect(validateTenantId("tenant-123")).toBe(true)
    expect(validateTenantId("../../etc/passwd")).toBe(false)
    expect(validateTenantId("UPPERCASE")).toBe(false)
  })
})

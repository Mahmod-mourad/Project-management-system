import { UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"

import { SupabaseService } from "../supabase/supabase.service"
import { AuthService } from "./auth.service"

describe("AuthService", () => {
  const sign = jest.fn().mockReturnValue("signed-token")
  const signOut = jest.fn()
  const signInWithPassword = jest.fn()
  const single = jest.fn()
  const eq = jest.fn(() => ({ single }))
  const select = jest.fn(() => ({ single, eq }))
  const from = jest.fn(() => ({ select }))

  // createAuthClient returns a separate client on purpose: signInWithPassword
  // stores a session on whichever client it is called on, and the shared one
  // must keep its service role authorisation for the profile lookup that
  // follows. The two are distinct here so a regression shows up as the sign-in
  // landing on the wrong client.
  const createAuthClient = jest.fn(() => ({ auth: { signInWithPassword } }))

  const supabaseService = {
    createAuthClient,
    client: {
      auth: { admin: { signOut } },
      from,
    },
  } as unknown as SupabaseService

  const service = new AuthService({ sign } as unknown as JwtService, supabaseService)

  beforeEach(() => jest.clearAllMocks())

  it("rejects invalid login credentials", async () => {
    signInWithPassword.mockResolvedValue({ data: {}, error: { message: "Invalid credentials" } })

    await expect(service.login({ email: "test@example.com", password: "wrong-password" })).rejects.toThrow(
      UnauthorizedException,
    )
  })

  it("signs a token carrying the tenant from the profile, not from the request", async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@example.com" } },
      error: null,
    })
    single.mockResolvedValue({
      data: { id: "user-1", tenant_id: "tenant-1", full_name: "Test User", role: "member" },
      error: null,
    })

    const result = await service.login({ email: "test@example.com", password: "SecurePassword123" })

    expect(sign).toHaveBeenCalledWith(expect.objectContaining({ sub: "user-1", tenant_id: "tenant-1" }))
    expect(result.access_token).toBe("signed-token")
    expect(result.user.role).toBe("member")
    expect(result.user.is_platform_admin).toBe(false)
  })

  it("refuses a login whose profile is missing", async () => {
    signInWithPassword.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null })
    single.mockResolvedValue({ data: null, error: { message: "no rows" } })

    await expect(service.login({ email: "test@example.com", password: "SecurePassword123" })).rejects.toThrow(
      UnauthorizedException,
    )
  })

  it("verifies the password on a throwaway client, not the shared one", async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@example.com" } },
      error: null,
    })
    single.mockResolvedValue({ data: { id: "user-1", tenant_id: "tenant-1" }, error: null })

    await service.login({ email: "test@example.com", password: "SecurePassword123" })

    expect(createAuthClient).toHaveBeenCalledTimes(1)
  })

  it("returns the validated profile", async () => {
    single.mockResolvedValue({ data: { id: "user-1", tenant_id: "tenant-1" }, error: null })

    await expect(service.validateUser("user-1")).resolves.toMatchObject({ id: "user-1" })
  })
})

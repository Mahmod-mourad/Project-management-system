import { BadRequestException, UnauthorizedException } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"

import type { SupabaseService } from "../supabase/supabase.service"
import { AuthService } from "./auth.service"

describe("AuthService", () => {
  const sign = jest.fn().mockReturnValue("signed-token")
  const createUser = jest.fn()
  const deleteUser = jest.fn()
  const signOut = jest.fn()
  const signInWithPassword = jest.fn()
  const single = jest.fn()
  const eq = jest.fn(() => ({ single }))
  const select = jest.fn(() => ({ single, eq }))
  const insert = jest.fn(() => ({ select }))
  const from = jest.fn(() => ({ insert, select }))

  const supabaseService = {
    client: {
      auth: { admin: { createUser, deleteUser, signOut }, signInWithPassword },
      from,
    },
  } as unknown as SupabaseService

  const service = new AuthService({ sign } as unknown as JwtService, supabaseService)

  beforeEach(() => jest.clearAllMocks())

  it("registers a user, creates a profile, and returns an application token", async () => {
    createUser.mockResolvedValue({ data: { user: { id: "user-1", email: "test@example.com" } }, error: null })
    single.mockResolvedValue({ data: { id: "user-1" }, error: null })

    const result = await service.register({
      email: "test@example.com",
      password: "SecurePassword123",
      full_name: "Test User",
      tenant_id: "tenant-1",
    })

    expect(createUser).toHaveBeenCalled()
    expect(from).toHaveBeenCalledWith("profiles")
    expect(result.access_token).toBe("signed-token")
    expect(result.user.tenant_id).toBe("tenant-1")
  })

  it("rejects a registration error from Supabase", async () => {
    createUser.mockResolvedValue({ data: { user: null }, error: { message: "User already exists" } })

    await expect(
      service.register({
        email: "test@example.com",
        password: "SecurePassword123",
        full_name: "Test User",
        tenant_id: "tenant-1",
      }),
    ).rejects.toThrow(BadRequestException)
  })

  it("rejects invalid login credentials", async () => {
    signInWithPassword.mockResolvedValue({ data: {}, error: { message: "Invalid credentials" } })

    await expect(service.login({ email: "test@example.com", password: "wrong-password" })).rejects.toThrow(
      UnauthorizedException,
    )
  })

  it("returns the validated profile", async () => {
    single.mockResolvedValue({ data: { id: "user-1", tenant_id: "tenant-1" }, error: null })

    await expect(service.validateUser("user-1")).resolves.toMatchObject({ id: "user-1" })
  })
})

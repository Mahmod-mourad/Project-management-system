import { ExecutionContext, ForbiddenException } from "@nestjs/common"
import { Reflector } from "@nestjs/core"

import { PlatformAdminGuard } from "./platform-admin.guard"
import { RolesGuard } from "./roles.guard"

const contextFor = (user: unknown): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => undefined,
    getClass: () => undefined,
  }) as unknown as ExecutionContext

describe("RolesGuard", () => {
  const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector
  const guard = new RolesGuard(reflector)

  beforeEach(() => jest.clearAllMocks())

  it("lets anything through when the handler asks for no role", () => {
    ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined)

    expect(guard.canActivate(contextFor({ id: "user-1" }))).toBe(true)
  })

  it("allows a caller holding one of the required roles", () => {
    ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(["admin"])

    expect(guard.canActivate(contextFor({ id: "user-1", role: "admin" }))).toBe(true)
  })

  it("refuses a caller holding a different role", () => {
    ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(["admin"])

    expect(() => guard.canActivate(contextFor({ id: "user-1", role: "member" }))).toThrow(ForbiddenException)
  })

  // The role is read from the profile the JWT strategy loaded, so a role sent
  // by the client is not the one being checked here.
  it("refuses a caller with no role at all", () => {
    ;(reflector.getAllAndOverride as jest.Mock).mockReturnValue(["admin"])

    expect(() => guard.canActivate(contextFor({ id: "user-1" }))).toThrow(ForbiddenException)
  })
})

describe("PlatformAdminGuard", () => {
  const guard = new PlatformAdminGuard()

  it("allows a platform administrator", () => {
    expect(guard.canActivate(contextFor({ id: "user-1", is_platform_admin: true }))).toBe(true)
  })

  it("refuses a tenant administrator", () => {
    expect(() => guard.canActivate(contextFor({ id: "user-1", role: "admin" }))).toThrow(ForbiddenException)
  })

  it("refuses an unauthenticated request", () => {
    expect(() => guard.canActivate(contextFor(undefined))).toThrow(ForbiddenException)
  })
})

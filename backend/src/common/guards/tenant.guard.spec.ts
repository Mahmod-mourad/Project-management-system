import { ForbiddenException, UnauthorizedException } from "@nestjs/common"
import { TenantGuard } from "./tenant.guard"

const activeTenant = { id: "tenant-a", status: "active", name: "Tenant A" }

const buildSupabase = (tenant: unknown) => {
  const single = jest.fn().mockResolvedValue({ data: tenant })
  const chain: Record<string, jest.Mock> = {}
  chain.select = jest.fn(() => chain)
  chain.eq = jest.fn(() => chain)
  chain.single = single
  return {
    client: {
      from: jest.fn(() => chain),
    },
  } as never
}

const contextFor = (request: unknown) =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
  }) as never

describe("TenantGuard", () => {
  it("allows a request whose header matches the caller's tenant", async () => {
    const guard = new TenantGuard(buildSupabase(activeTenant))
    const request: Record<string, unknown> = {
      headers: { "x-tenant-id": "tenant-a" },
      user: { id: "user-1", tenant_id: "tenant-a" },
    }

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true)
    expect(request.tenant).toEqual(activeTenant)
  })

  it("rejects a caller reaching for another tenant", async () => {
    const guard = new TenantGuard(buildSupabase(activeTenant))
    const request = {
      headers: { "x-tenant-id": "tenant-b" },
      user: { id: "user-1", tenant_id: "tenant-a" },
    }

    await expect(guard.canActivate(contextFor(request))).rejects.toBeInstanceOf(ForbiddenException)
  })

  it("rejects a request with no tenant header", async () => {
    const guard = new TenantGuard(buildSupabase(activeTenant))
    const request = { headers: {}, user: { id: "user-1", tenant_id: "tenant-a" } }

    await expect(guard.canActivate(contextFor(request))).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it("rejects a request that never went through the JWT guard", async () => {
    const guard = new TenantGuard(buildSupabase(activeTenant))
    const request = { headers: { "x-tenant-id": "tenant-a" } }

    await expect(guard.canActivate(contextFor(request))).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it("rejects a tenant that is not active", async () => {
    const guard = new TenantGuard(buildSupabase(null))
    const request = {
      headers: { "x-tenant-id": "tenant-a" },
      user: { id: "user-1", tenant_id: "tenant-a" },
    }

    await expect(guard.canActivate(contextFor(request))).rejects.toBeInstanceOf(UnauthorizedException)
  })
})

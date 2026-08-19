import { ForbiddenException } from "@nestjs/common"

import { TenantController } from "./tenant.controller"
import { TenantService } from "./tenant.service"

/**
 * Who may read and change a tenant.
 *
 * Every route on this controller used to carry no guard at all, so these are the
 * rules that replaced "anyone, signed in or not".
 */
describe("TenantController authorization", () => {
  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn().mockResolvedValue({ id: "tenant-1" }),
    getTenantStats: jest.fn().mockResolvedValue({ users: 1, projects: 0, tasks: 0 }),
    update: jest.fn(),
    remove: jest.fn(),
  } as unknown as TenantService

  const controller = new TenantController(service)

  const request = (user: { id: string; tenant_id: string; is_platform_admin?: boolean }) =>
    ({ user }) as never

  beforeEach(() => jest.clearAllMocks())

  it("lets a member read the tenant they belong to", async () => {
    await controller.findOne("tenant-1", request({ id: "user-1", tenant_id: "tenant-1" }))

    expect(service.findOne).toHaveBeenCalledWith("tenant-1")
  })

  it("refuses a member reading a tenant that is not theirs", () => {
    expect(() => controller.findOne("tenant-2", request({ id: "user-1", tenant_id: "tenant-1" }))).toThrow(
      ForbiddenException,
    )

    expect(service.findOne).not.toHaveBeenCalled()
  })

  it("lets a platform administrator read any tenant", async () => {
    await controller.findOne("tenant-2", request({ id: "user-1", tenant_id: "tenant-1", is_platform_admin: true }))

    expect(service.findOne).toHaveBeenCalledWith("tenant-2")
  })

  it("applies the same rule to the stats route", () => {
    expect(() => controller.getStats("tenant-2", request({ id: "user-1", tenant_id: "tenant-1" }))).toThrow(
      ForbiddenException,
    )
  })

  it("refuses deleting the tenant the caller is signed in to", () => {
    expect(() =>
      controller.remove("tenant-1", request({ id: "user-1", tenant_id: "tenant-1", is_platform_admin: true })),
    ).toThrow(ForbiddenException)

    expect(service.remove).not.toHaveBeenCalled()
  })

  it("deletes another tenant for a platform administrator", () => {
    controller.remove("tenant-2", request({ id: "user-1", tenant_id: "tenant-1", is_platform_admin: true }))

    expect(service.remove).toHaveBeenCalledWith("tenant-2")
  })
})

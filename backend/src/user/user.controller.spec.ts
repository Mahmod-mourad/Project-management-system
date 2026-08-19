import { ForbiddenException } from "@nestjs/common"

import { UserController } from "./user.controller"
import { UserService } from "./user.service"

/**
 * The authorization rules on the users routes.
 *
 * Before these, PATCH /users/:id took whatever body it was given and wrote it to
 * whatever profile the id named, as long as the caller was signed in to the same
 * tenant. Two separate holes: you could edit anybody, and you could set your own
 * role.
 */
describe("UserController authorization", () => {
  const service = {
    create: jest.fn().mockResolvedValue({ id: "new-user" }),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn().mockResolvedValue({ id: "user-1" }),
    remove: jest.fn().mockResolvedValue({ message: "User deleted successfully" }),
  } as unknown as UserService

  const controller = new UserController(service)

  const request = (user: { id: string; role?: string }) =>
    ({
      user: { ...user, tenant_id: "tenant-1" },
      headers: { "x-tenant-id": "tenant-1" },
    }) as never

  beforeEach(() => jest.clearAllMocks())

  it("lets a member edit their own profile", async () => {
    await controller.update("user-1", request({ id: "user-1", role: "member" }), { full_name: "New Name" })

    expect(service.update).toHaveBeenCalledWith("tenant-1", "user-1", { full_name: "New Name" })
  })

  it("stops a member editing somebody else", () => {
    expect(() =>
      controller.update("user-2", request({ id: "user-1", role: "member" }), { full_name: "New Name" }),
    ).toThrow(ForbiddenException)

    expect(service.update).not.toHaveBeenCalled()
  })

  it("drops role when a member sends it, rather than promoting them", async () => {
    await controller.update("user-1", request({ id: "user-1", role: "member" }), {
      full_name: "New Name",
      role: "admin" as never,
    })

    expect(service.update).toHaveBeenCalledWith("tenant-1", "user-1", { full_name: "New Name" })
  })

  it("keeps role when an administrator sends it", async () => {
    await controller.update("user-2", request({ id: "user-1", role: "admin" }), { role: "manager" as never })

    expect(service.update).toHaveBeenCalledWith("tenant-1", "user-2", { role: "manager" })
  })

  it("lets an administrator edit anyone in the tenant", async () => {
    await controller.update("user-2", request({ id: "user-1", role: "admin" }), { department: "Design" })

    expect(service.update).toHaveBeenCalledWith("tenant-1", "user-2", { department: "Design" })
  })

  it("refuses to delete the caller's own account", () => {
    expect(() => controller.remove("user-1", request({ id: "user-1", role: "admin" }))).toThrow(ForbiddenException)

    expect(service.remove).not.toHaveBeenCalled()
  })

  it("creates the user in the caller's tenant, not one named in the body", async () => {
    await controller.create(request({ id: "user-1", role: "admin" }), {
      email: "new@example.com",
      password: "SecurePassword123",
      full_name: "New User",
    })

    expect(service.create).toHaveBeenCalledWith("tenant-1", expect.objectContaining({ email: "new@example.com" }))
  })
})

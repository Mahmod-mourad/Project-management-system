import { NotFoundException } from "@nestjs/common"

import { SupabaseService } from "../supabase/supabase.service"
import { TenantService } from "./tenant.service"

describe("TenantService", () => {
  const single = jest.fn()
  const order = jest.fn()
  const eq: jest.Mock = jest.fn(() => ({ single, select: jest.fn(() => ({ single })) }))
  const select = jest.fn(() => ({ single, eq, order }))
  const insert = jest.fn(() => ({ select }))
  const update = jest.fn(() => ({ eq }))
  const deleteQuery = jest.fn(() => ({ eq }))
  const from = jest.fn(() => ({ insert, select, update, delete: deleteQuery }))

  const service = new TenantService({ client: { from } } as unknown as SupabaseService)

  beforeEach(() => jest.clearAllMocks())

  it("creates a tenant", async () => {
    single.mockResolvedValue({ data: { id: "tenant-1", name: "Test Company" }, error: null })

    await expect(service.create({ name: "Test Company", domain: "test-company" })).resolves.toMatchObject({
      id: "tenant-1",
    })
    expect(from).toHaveBeenCalledWith("tenants")
  })

  it("returns tenants ordered by creation date", async () => {
    order.mockResolvedValue({ data: [{ id: "tenant-1" }], error: null })

    await expect(service.findAll()).resolves.toHaveLength(1)
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false })
  })

  it("throws when a tenant cannot be found", async () => {
    single.mockResolvedValue({ data: null, error: { message: "not found" } })

    await expect(service.findOne("missing")).rejects.toThrow(NotFoundException)
  })

  it("deletes a tenant", async () => {
    eq.mockResolvedValue({ error: null })

    await expect(service.remove("tenant-1")).resolves.toEqual({ message: "Tenant deleted successfully" })
  })
})

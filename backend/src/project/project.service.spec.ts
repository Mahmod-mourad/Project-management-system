import { ProjectService } from "./project.service"
import { SupabaseService } from "../supabase/supabase.service"

/**
 * Project team handling.
 *
 * CreateProjectDto has always documented team_member_ids, but create() spread
 * the whole DTO into the projects insert. There is no such column, so any
 * request that used the field failed, and project_members stayed empty forever.
 */
describe("ProjectService team membership", () => {
  const single = jest.fn()
  const insertProject = jest.fn(() => ({ select: () => ({ single }) }))
  const insertMembers = jest.fn().mockResolvedValue({ error: null })
  const deleteMembers = jest.fn(() => ({ eq: jest.fn().mockResolvedValue({ error: null }) }))
  const profileLookup = jest.fn()

  const from = jest.fn((table: string) => {
    if (table === "projects") return { insert: insertProject }
    if (table === "project_members") return { insert: insertMembers, delete: deleteMembers }
    if (table === "profiles") {
      return { select: () => ({ eq: () => ({ in: profileLookup }) }) }
    }
    throw new Error(`unexpected table ${table}`)
  })

  const service = new ProjectService({ client: { from } } as unknown as SupabaseService)

  beforeEach(() => {
    jest.clearAllMocks()
    single.mockResolvedValue({ data: { id: "project-1" }, error: null })
  })

  it("keeps team_member_ids out of the projects insert", async () => {
    profileLookup.mockResolvedValue({ data: [{ id: "user-1" }], error: null })

    await service.create("tenant-1", { name: "Website redesign", team_member_ids: ["user-1"] })

    expect(insertProject).toHaveBeenCalledWith({ name: "Website redesign", tenant_id: "tenant-1" })
  })

  it("writes the team to project_members", async () => {
    profileLookup.mockResolvedValue({ data: [{ id: "user-1" }, { id: "user-2" }], error: null })

    await service.create("tenant-1", { name: "Website redesign", team_member_ids: ["user-1", "user-2"] })

    expect(insertMembers).toHaveBeenCalledWith([
      { project_id: "project-1", user_id: "user-1" },
      { project_id: "project-1", user_id: "user-2" },
    ])
  })

  // The ids come from a request body, so they are not necessarily this tenant's.
  it("ignores ids that belong to another tenant", async () => {
    profileLookup.mockResolvedValue({ data: [], error: null })

    await service.create("tenant-1", { name: "Website redesign", team_member_ids: ["outsider"] })

    expect(insertMembers).not.toHaveBeenCalled()
  })

  it("leaves the team alone when the request does not mention it", async () => {
    await service.create("tenant-1", { name: "Website redesign" })

    expect(deleteMembers).not.toHaveBeenCalled()
    expect(insertMembers).not.toHaveBeenCalled()
  })
})

import { Injectable, NotFoundException } from "@nestjs/common"
import { SupabaseService } from "../supabase/supabase.service"
import { CreateProjectDto, UpdateProjectDto } from "./dto/project.dto"

@Injectable()
export class ProjectService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Creates a project and, if the request named any, its team.
   *
   * team_member_ids is a field on the DTO but never a column on projects. The
   * old code spread the whole DTO into the insert, so any request that actually
   * used the documented field failed on "column team_member_ids does not exist",
   * and project_members was never written by anything.
   */
  async create(tenantId: string, createProjectDto: CreateProjectDto) {
    const { team_member_ids, ...projectColumns } = createProjectDto

    const { data, error } = await this.supabaseService.client
      .from("projects")
      .insert({ ...projectColumns, tenant_id: tenantId })
      .select()
      .single()

    if (error) throw error

    await this.replaceTeam(tenantId, data.id, team_member_ids)

    return data
  }

  async findAll(tenantId: string) {
    const { data, error } = await this.supabaseService.client
      .from("projects")
      .select(`
        *,
        tasks:tasks(count),
        team_members:project_members(
          user:profiles(id, full_name, email)
        )
      `)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  }

  async findOne(tenantId: string, id: string) {
    const { data, error } = await this.supabaseService.client
      .from("projects")
      .select(`
        *,
        tasks:tasks(*),
        team_members:project_members(
          user:profiles(id, full_name, email, avatar_url)
        )
      `)
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .single()

    if (error) throw new NotFoundException("Project not found")
    return data
  }

  async update(tenantId: string, id: string, updateProjectDto: UpdateProjectDto) {
    const { team_member_ids, ...projectColumns } = updateProjectDto

    const { data, error } = await this.supabaseService.client
      .from("projects")
      .update(projectColumns)
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    await this.replaceTeam(tenantId, id, team_member_ids)

    return data
  }

  async remove(tenantId: string, id: string) {
    const { error } = await this.supabaseService.client.from("projects").delete().eq("tenant_id", tenantId).eq("id", id)

    if (error) throw error
    return { message: "Project deleted successfully" }
  }

  /**
   * Sets a project's team to exactly the given profiles, or leaves it alone when
   * the request said nothing about the team.
   *
   * Only profiles inside the tenant are accepted, so naming somebody else's user
   * id adds nobody rather than putting an outsider on the project.
   */
  private async replaceTeam(tenantId: string, projectId: string, memberIds?: string[]): Promise<void> {
    if (memberIds === undefined) return

    const { error: clearError } = await this.supabaseService.client
      .from("project_members")
      .delete()
      .eq("project_id", projectId)

    if (clearError) throw clearError

    if (memberIds.length === 0) return

    const { data: members, error: lookupError } = await this.supabaseService.client
      .from("profiles")
      .select("id")
      .eq("tenant_id", tenantId)
      .in("id", memberIds)

    if (lookupError) throw lookupError
    if (!members || members.length === 0) return

    const { error: insertError } = await this.supabaseService.client
      .from("project_members")
      .insert(members.map((member) => ({ project_id: projectId, user_id: member.id })))

    if (insertError) throw insertError
  }

  async getProjectStats(tenantId: string, projectId: string) {
    const [tasks, completedTasks, teamMembers] = await Promise.all([
      this.supabaseService.client
        .from("tasks")
        .select("id", { count: "exact" })
        .eq("tenant_id", tenantId)
        .eq("project_id", projectId),
      this.supabaseService.client
        .from("tasks")
        .select("id", { count: "exact" })
        .eq("tenant_id", tenantId)
        .eq("project_id", projectId)
        .eq("status", "completed"),
      this.supabaseService.client.from("project_members").select("id", { count: "exact" }).eq("project_id", projectId),
    ])

    return {
      totalTasks: tasks.count || 0,
      completedTasks: completedTasks.count || 0,
      teamMembers: teamMembers.count || 0,
      completionRate: tasks.count ? Math.round(((completedTasks.count || 0) / tasks.count) * 100) : 0,
    }
  }
}

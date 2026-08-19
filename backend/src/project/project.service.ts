import { Injectable, NotFoundException } from "@nestjs/common"
import { SupabaseService } from "../supabase/supabase.service"
import { CreateProjectDto, UpdateProjectDto } from "./dto/project.dto"

@Injectable()
export class ProjectService {
  constructor(private supabaseService: SupabaseService) {}

  async create(tenantId: string, createProjectDto: CreateProjectDto) {
    const { data, error } = await this.supabaseService.client
      .from("projects")
      .insert({ ...createProjectDto, tenant_id: tenantId })
      .select()
      .single()

    if (error) throw error
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
    const { data, error } = await this.supabaseService.client
      .from("projects")
      .update(updateProjectDto)
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async remove(tenantId: string, id: string) {
    const { error } = await this.supabaseService.client.from("projects").delete().eq("tenant_id", tenantId).eq("id", id)

    if (error) throw error
    return { message: "Project deleted successfully" }
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

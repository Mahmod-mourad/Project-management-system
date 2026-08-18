import { Injectable, NotFoundException } from "@nestjs/common"
import type { SupabaseService } from "../supabase/supabase.service"
import type { CreateTaskDto, UpdateTaskDto } from "./dto/task.dto"

@Injectable()
export class TaskService {
  constructor(private supabaseService: SupabaseService) {}

  async create(tenantId: string, createTaskDto: CreateTaskDto) {
    const { data, error } = await this.supabaseService.client
      .from("tasks")
      .insert({ ...createTaskDto, tenant_id: tenantId })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async findAll(tenantId: string, projectId?: string) {
    let query = this.supabaseService.client
      .from("tasks")
      .select(`
        *,
        project:projects(id, name),
        assignee:profiles!tasks_assignee_id_fkey(id, full_name, email)
      `)
      .eq("tenant_id", tenantId)

    if (projectId) {
      query = query.eq("project_id", projectId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error
    return data
  }

  async findOne(tenantId: string, id: string) {
    const { data, error } = await this.supabaseService.client
      .from("tasks")
      .select(`
        *,
        project:projects(id, name),
        assignee:profiles!tasks_assignee_id_fkey(id, full_name, email, avatar_url)
      `)
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .single()

    if (error) throw new NotFoundException("Task not found")
    return data
  }

  async update(tenantId: string, id: string, updateTaskDto: UpdateTaskDto) {
    const { data, error } = await this.supabaseService.client
      .from("tasks")
      .update(updateTaskDto)
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async remove(tenantId: string, id: string) {
    const { error } = await this.supabaseService.client.from("tasks").delete().eq("tenant_id", tenantId).eq("id", id)

    if (error) throw error
    return { message: "Task deleted successfully" }
  }

  async getTasksByStatus(tenantId: string) {
    const { data, error } = await this.supabaseService.client.from("tasks").select("status").eq("tenant_id", tenantId)

    if (error) throw error

    const statusCounts = data.reduce<Record<string, number>>((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {})

    return statusCounts
  }
}

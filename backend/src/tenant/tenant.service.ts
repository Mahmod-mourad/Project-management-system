import { Injectable, NotFoundException } from "@nestjs/common"
import { SupabaseService } from "../supabase/supabase.service"
import { CreateTenantDto, UpdateTenantDto } from "./dto/tenant.dto"

@Injectable()
export class TenantService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createTenantDto: CreateTenantDto) {
    const { data, error } = await this.supabaseService.client.from("tenants").insert(createTenantDto).select().single()

    if (error) throw error
    return data
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService.client.from("tenants").select("*").eq("id", id).single()

    if (error) throw new NotFoundException("Tenant not found")
    return data
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    const { data, error } = await this.supabaseService.client
      .from("tenants")
      .update(updateTenantDto)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async remove(id: string) {
    const { error } = await this.supabaseService.client.from("tenants").delete().eq("id", id)

    if (error) throw error
    return { message: "Tenant deleted successfully" }
  }

  async getTenantStats(tenantId: string) {
    // Get comprehensive tenant statistics
    const [users, projects, tasks, inventory] = await Promise.all([
      this.supabaseService.client.from("profiles").select("id", { count: "exact" }).eq("tenant_id", tenantId),
      this.supabaseService.client.from("projects").select("id", { count: "exact" }).eq("tenant_id", tenantId),
      this.supabaseService.client.from("tasks").select("id", { count: "exact" }).eq("tenant_id", tenantId),
      this.supabaseService.client.from("inventory_items").select("id", { count: "exact" }).eq("tenant_id", tenantId),
    ])

    return {
      users: users.count || 0,
      projects: projects.count || 0,
      tasks: tasks.count || 0,
      inventory: inventory.count || 0,
    }
  }
}

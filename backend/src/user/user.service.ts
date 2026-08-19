import { Injectable, NotFoundException } from "@nestjs/common"
import { SupabaseService } from "../supabase/supabase.service"
import { UpdateUserDto } from "./dto/user.dto"

@Injectable()
export class UserService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(tenantId: string) {
    const { data, error } = await this.supabaseService.client
      .from("profiles")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  }

  async findOne(tenantId: string, id: string) {
    const { data, error } = await this.supabaseService.client
      .from("profiles")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .single()

    if (error) throw new NotFoundException("User not found")
    return data
  }

  async update(tenantId: string, id: string, updateUserDto: UpdateUserDto) {
    const { data, error } = await this.supabaseService.client
      .from("profiles")
      .update(updateUserDto)
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async remove(tenantId: string, id: string) {
    // Delete from profiles table
    const { error: profileError } = await this.supabaseService.client
      .from("profiles")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("id", id)

    if (profileError) throw profileError

    // Delete from auth
    const { error: authError } = await this.supabaseService.client.auth.admin.deleteUser(id)

    if (authError) throw authError

    return { message: "User deleted successfully" }
  }
}

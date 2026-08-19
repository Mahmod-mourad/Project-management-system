import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { SupabaseService } from "../supabase/supabase.service"
import { CreateUserDto, TenantRole, UpdateUserDto } from "./dto/user.dto"

/** Columns that may be returned to the API. Keeps is_platform_admin out of tenant listings. */
const PUBLIC_COLUMNS = "id, tenant_id, email, full_name, avatar_url, phone, department, role, created_at, updated_at"

@Injectable()
export class UserService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Adds a user to a tenant.
   *
   * This was AuthService.register, reached through the public POST /auth/register
   * with the tenant named in the request body. The tenant is now the caller's,
   * decided by the guard chain before this method runs.
   */
  async create(tenantId: string, createUserDto: CreateUserDto) {
    const { email, password, full_name, role, phone, department } = createUserDto

    const { data: authData, error: authError } = await this.supabaseService.client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, tenant_id: tenantId },
    })

    if (authError) {
      throw new BadRequestException(authError.message)
    }

    const { data: profile, error: profileError } = await this.supabaseService.client
      .from("profiles")
      .insert({
        id: authData.user.id,
        tenant_id: tenantId,
        email,
        full_name,
        role: role ?? TenantRole.MEMBER,
        phone: phone ?? null,
        department: department ?? null,
      })
      .select(PUBLIC_COLUMNS)
      .single()

    if (profileError) {
      // Without this the account exists in auth with no profile, which fails
      // every request it makes and cannot be fixed from the users screen.
      await this.supabaseService.client.auth.admin.deleteUser(authData.user.id)
      throw new BadRequestException("Failed to create user profile")
    }

    return profile
  }

  async findAll(tenantId: string) {
    const { data, error } = await this.supabaseService.client
      .from("profiles")
      .select(PUBLIC_COLUMNS)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  }

  async findOne(tenantId: string, id: string) {
    const { data, error } = await this.supabaseService.client
      .from("profiles")
      .select(PUBLIC_COLUMNS)
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
      .select(PUBLIC_COLUMNS)
      .single()

    if (error) throw error
    return data
  }

  async remove(tenantId: string, id: string) {
    // Scoped to the tenant, so a caller cannot delete a profile that is not
    // theirs to delete. The row count tells us whether it matched.
    const { data: deleted, error: profileError } = await this.supabaseService.client
      .from("profiles")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .select("id")

    if (profileError) throw profileError

    if (!deleted || deleted.length === 0) {
      // The old code deleted the auth account regardless of whether the profile
      // delete matched anything, so a bad id still destroyed a login.
      throw new NotFoundException("User not found")
    }

    const { error: authError } = await this.supabaseService.client.auth.admin.deleteUser(id)

    if (authError) throw authError

    return { message: "User deleted successfully" }
  }
}

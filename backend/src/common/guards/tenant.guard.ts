import { Injectable, type CanActivate, type ExecutionContext, UnauthorizedException } from "@nestjs/common"
import type { SupabaseService } from "../services/supabase.service"

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const tenantId = request.headers["x-tenant-id"]

    if (!tenantId) {
      throw new UnauthorizedException("Tenant ID is required")
    }

    // Verify tenant exists and user has access
    const { data: tenant } = await this.supabaseService.client
      .from("tenants")
      .select("*")
      .eq("id", tenantId)
      .eq("status", "active")
      .single()

    if (!tenant) {
      throw new UnauthorizedException("Invalid tenant")
    }

    request.tenant = tenant
    return true
  }
}

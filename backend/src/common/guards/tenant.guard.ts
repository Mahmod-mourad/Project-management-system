import { Injectable, type CanActivate, type ExecutionContext, ForbiddenException, UnauthorizedException } from "@nestjs/common"
import { SupabaseService } from "../services/supabase.service"

/**
 * Resolves the tenant named by the x-tenant-id header and confirms the caller
 * actually belongs to it.
 *
 * The header is client supplied, so checking only that the tenant exists is not
 * enough: any signed-in user could read another tenant's data by changing the
 * header. The authenticated profile carries the tenant the user was created
 * under, and that is the value the request has to match.
 *
 * Must run after JwtAuthGuard, which is what puts the profile on the request.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const tenantId = request.headers["x-tenant-id"]

    if (!tenantId) {
      throw new UnauthorizedException("Tenant ID is required")
    }

    const user = request.user

    if (!user?.tenant_id) {
      throw new UnauthorizedException("Authenticated user has no tenant")
    }

    if (user.tenant_id !== tenantId) {
      throw new ForbiddenException("Tenant does not match the authenticated user")
    }

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

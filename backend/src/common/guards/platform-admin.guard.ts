import { Injectable, type CanActivate, type ExecutionContext, ForbiddenException } from "@nestjs/common"

/**
 * Guards the endpoints that operate on tenants themselves.
 *
 * Creating, listing, renaming and removing tenants are operator actions: they
 * cross the tenant boundary, so no role inside a tenant can be the thing that
 * authorises them. They are gated on profiles.is_platform_admin, which nothing
 * in the API can set — it is granted in the database.
 *
 * Must run after JwtAuthGuard, which is what puts the profile on the request.
 */
@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest()

    if (!user?.is_platform_admin) {
      throw new ForbiddenException("Platform administrator access is required")
    }

    return true
  }
}

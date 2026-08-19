import { Injectable, type CanActivate, type ExecutionContext, ForbiddenException } from "@nestjs/common"
import { Reflector } from "@nestjs/core"

import { ROLES_KEY } from "../decorators/roles.decorator"

/**
 * Checks the caller's role against whatever @Roles() the handler asks for.
 *
 * Must run after JwtAuthGuard, which is what puts the profile on the request.
 * The role is read from that profile — the database row — and never from the
 * request, so a caller cannot grant themselves a role by sending one.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!required || required.length === 0) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()

    if (!user?.role || !required.includes(user.role)) {
      throw new ForbiddenException(`This action requires one of: ${required.join(", ")}`)
    }

    return true
  }
}

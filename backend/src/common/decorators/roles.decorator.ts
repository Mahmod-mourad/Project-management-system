import { SetMetadata } from "@nestjs/common"

export const ROLES_KEY = "roles"

/**
 * Restricts a handler to the listed tenant roles.
 *
 * Only meaningful alongside RolesGuard, which reads this metadata. The role
 * comes from the authenticated profile, so it cannot be set by the caller.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles)

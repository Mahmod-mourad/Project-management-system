import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  ForbiddenException,
  UseGuards,
  Req,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"
import { Request } from "express"
import { TenantService } from "./tenant.service"
import { CreateTenantDto, UpdateTenantDto } from "./dto/tenant.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { PlatformAdminGuard } from "../common/guards/platform-admin.guard"

interface AuthenticatedRequest extends Request {
  user: {
    id: string
    tenant_id: string
    is_platform_admin?: boolean
  }
}

/**
 * Tenant administration.
 *
 * Every route here used to be open: no guard of any kind, so an unauthenticated
 * GET /tenants returned every customer on the platform, and DELETE /tenants/:id
 * removed one. Worse, the ids that listing handed out were the only thing
 * standing between an outsider and a tenant's data, because registration used
 * to accept any tenant_id it was given.
 *
 * The cross-tenant routes now need a platform administrator. Reading one tenant
 * is allowed for its own members as well, because the app shows the tenant's
 * name and usage on screen.
 */
@ApiTags("tenants")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("tenants")
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @UseGuards(PlatformAdminGuard)
  @ApiOperation({ summary: "Create a new tenant (platform administrators only)" })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto)
  }

  @Get()
  @UseGuards(PlatformAdminGuard)
  @ApiOperation({ summary: "List every tenant (platform administrators only)" })
  findAll() {
    return this.tenantService.findAll()
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a tenant, if you belong to it or administer the platform" })
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    this.assertMayRead(req, id)
    return this.tenantService.findOne(id)
  }

  @Get(":id/stats")
  @ApiOperation({ summary: "Get tenant statistics, if you belong to it or administer the platform" })
  getStats(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    this.assertMayRead(req, id)
    return this.tenantService.getTenantStats(id)
  }

  @Patch(":id")
  @UseGuards(PlatformAdminGuard)
  @ApiOperation({ summary: "Update a tenant (platform administrators only)" })
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantService.update(id, updateTenantDto)
  }

  @Delete(":id")
  @UseGuards(PlatformAdminGuard)
  @ApiOperation({ summary: "Delete a tenant (platform administrators only)" })
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    // Deleting the tenant you are signed in to cascades away your own profile
    // mid-request. It is always a mistake, so it is refused rather than handled.
    if (req.user.tenant_id === id) {
      throw new ForbiddenException("You cannot delete the tenant you are signed in to")
    }

    return this.tenantService.remove(id)
  }

  /** A tenant is readable by its own members, and by platform administrators. */
  private assertMayRead(req: AuthenticatedRequest, tenantId: string): void {
    if (req.user.is_platform_admin) return
    if (req.user.tenant_id === tenantId) return

    throw new ForbiddenException("You do not have access to this tenant")
  }
}

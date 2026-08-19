import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Body,
  ForbiddenException,
  UseGuards,
  Req,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from "@nestjs/swagger"
import { Request } from "express"
import { UserService } from "./user.service"
import { CreateUserDto, TenantRole, UpdateUserDto } from "./dto/user.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { TenantGuard } from "../common/guards/tenant.guard"
import { Roles } from "../common/decorators/roles.decorator"
import { RolesGuard } from "../common/guards/roles.guard"

interface AuthenticatedRequest extends Request {
  user: {
    id: string
    role?: string
    tenant_id: string
  }
}

@ApiTags("users")
@ApiBearerAuth()
@ApiHeader({ name: "x-tenant-id", required: true })
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(TenantRole.ADMIN)
  @ApiOperation({ summary: "Add a user to this tenant" })
  create(@Req() req: AuthenticatedRequest, @Body() createUserDto: CreateUserDto) {
    const tenantId = req.headers["x-tenant-id"] as string
    return this.userService.create(tenantId, createUserDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all users for tenant' })
  findAll(@Req() req: AuthenticatedRequest) {
    const tenantId = req.headers['x-tenant-id'] as string;
    return this.userService.findAll(tenantId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const tenantId = req.headers["x-tenant-id"] as string
    return this.userService.findOne(tenantId, id)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update user" })
  update(@Param('id') id: string, @Req() req: AuthenticatedRequest, @Body() updateUserDto: UpdateUserDto) {
    const tenantId = req.headers["x-tenant-id"] as string
    const isAdmin = req.user.role === TenantRole.ADMIN

    // Anyone could edit anyone in the tenant before this. Editing your own row
    // is ordinary profile editing; editing someone else's is administration.
    if (!isAdmin && req.user.id !== id) {
      throw new ForbiddenException("You can only edit your own profile")
    }

    // `role` was accepted from whoever sent it and written straight to the
    // profile, so a member could PATCH their own row to role "admin". It is
    // dropped for everyone but administrators.
    const patch = { ...updateUserDto }
    if (!isAdmin) {
      delete patch.role
    }

    return this.userService.update(tenantId, id, patch)
  }

  @Delete(":id")
  @Roles(TenantRole.ADMIN)
  @ApiOperation({ summary: "Delete user" })
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    // An administrator removing their own account leaves the tenant with one
    // fewer administrator and possibly none at all.
    if (req.user.id === id) {
      throw new ForbiddenException("You cannot remove your own account")
    }

    const tenantId = req.headers["x-tenant-id"] as string
    return this.userService.remove(tenantId, id)
  }
}

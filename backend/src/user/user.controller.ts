import { Controller, Get, Patch, Param, Delete, Body, UseGuards, Req } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from "@nestjs/swagger"
import type { UserService } from "./user.service"
import type { UpdateUserDto } from "./dto/user.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { TenantGuard } from "../common/guards/tenant.guard"
import type { Request } from "express"

@ApiTags("users")
@ApiBearerAuth()
@ApiHeader({ name: "x-tenant-id", required: true })
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users for tenant' })
  findAll(@Req() req: Request) {
    const tenantId = req.headers['x-tenant-id'] as string;
    return this.userService.findAll(tenantId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  findOne(@Param('id') id: string, @Req() req: Request) {
    const tenantId = req.headers["x-tenant-id"] as string
    return this.userService.findOne(tenantId, id)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update user" })
  update(@Param('id') id: string, @Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const tenantId = req.headers["x-tenant-id"] as string
    return this.userService.update(tenantId, id, updateUserDto)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete user" })
  remove(@Param('id') id: string, @Req() req: Request) {
    const tenantId = req.headers["x-tenant-id"] as string
    return this.userService.remove(tenantId, id)
  }
}

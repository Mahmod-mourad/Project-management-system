import { Controller, Get, Post, Patch, Param, UseGuards, Request } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from "@nestjs/swagger"
import { NotificationService } from "./notification.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { TenantGuard } from "../common/guards/tenant.guard"

/** The authenticated profile the JWT strategy puts on the request. */
interface AuthenticatedRequest {
  user: {
    id: string
    tenant_id: string
  }
}

@ApiTags("notifications")
@ApiBearerAuth()
@ApiHeader({ name: "x-tenant-id", required: true })
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  findAll(@Request() req: AuthenticatedRequest) {
    return this.notificationService.findAll(req.user.tenant_id, req.user.id);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark notification as read" })
  markAsRead(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.notificationService.markAsRead(req.user.tenant_id, req.user.id, id)
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@Request() req: AuthenticatedRequest) {
    return this.notificationService.markAllAsRead(req.user.tenant_id, req.user.id);
  }
}

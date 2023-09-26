import { Controller, Get, Post, Patch, Param, Delete, UseGuards, Query, Headers } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiQuery } from "@nestjs/swagger"
import type { TaskService } from "./task.service"
import type { CreateTaskDto, UpdateTaskDto } from "./dto/task.dto"
import { TenantGuard } from "../common/guards/tenant.guard"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("tasks")
@ApiBearerAuth()
@ApiHeader({ name: "x-tenant-id", required: true })
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller("tasks")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: "Create a new task" })
  create(createTaskDto: CreateTaskDto, @Headers('x-tenant-id') tenantId: string) {
    return this.taskService.create(tenantId, createTaskDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all tasks for tenant" })
  @ApiQuery({ name: "project_id", required: false })
  findAll(@Headers('x-tenant-id') tenantId: string, @Query('project_id') projectId?: string) {
    return this.taskService.findAll(tenantId, projectId)
  }

  @Get('by-status')
  @ApiOperation({ summary: 'Get tasks grouped by status' })
  getTasksByStatus(@Headers('x-tenant-id') tenantId: string) {
    return this.taskService.getTasksByStatus(tenantId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get task by ID" })
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.taskService.findOne(tenantId, id)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update task" })
  update(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string, updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(tenantId, id, updateTaskDto)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete task" })
  remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.taskService.remove(tenantId, id)
  }
}

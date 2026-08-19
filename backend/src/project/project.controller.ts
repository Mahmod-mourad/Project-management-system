import { Body, Controller, Get, Post, Patch, Param, Delete, UseGuards, Headers } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from "@nestjs/swagger"
import { ProjectService } from "./project.service"
import { CreateProjectDto, UpdateProjectDto } from "./dto/project.dto"
import { TenantGuard } from "../common/guards/tenant.guard"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("projects")
@ApiBearerAuth()
@ApiHeader({ name: "x-tenant-id", required: true })
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller("projects")
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: "Create a new project" })
  create(@Body() createProjectDto: CreateProjectDto, @Headers('x-tenant-id') tenantId: string) {
    return this.projectService.create(tenantId, createProjectDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects for tenant' })
  findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.projectService.findAll(tenantId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get project by ID" })
  findOne(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.projectService.findOne(tenantId, id)
  }

  @Get(":id/stats")
  @ApiOperation({ summary: "Get project statistics" })
  getStats(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.projectService.getProjectStats(tenantId, id)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update project" })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Headers('x-tenant-id') tenantId: string) {
    return this.projectService.update(tenantId, id, updateProjectDto)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete project" })
  remove(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.projectService.remove(tenantId, id)
  }
}

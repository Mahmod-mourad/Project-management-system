import { Body, Controller, Get, Post, Patch, Param, Delete, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"
import { TenantService } from "./tenant.service"
import { CreateTenantDto, UpdateTenantDto } from "./dto/tenant.dto"
import { TenantGuard } from "../common/guards/tenant.guard"

@ApiTags("tenants")
@ApiBearerAuth()
@Controller("tenants")
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @ApiOperation({ summary: "Create a new tenant" })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all tenants" })
  findAll() {
    return this.tenantService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id);
  }

  @Get(':id/stats')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get tenant statistics' })
  getStats(@Param('id') id: string) {
    return this.tenantService.getTenantStats(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update tenant" })
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantService.update(id, updateTenantDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tenant' })
  remove(@Param('id') id: string) {
    return this.tenantService.remove(id);
  }
}

import { IsString, IsOptional, IsEnum, IsObject } from "class-validator"
import { ApiProperty, PartialType } from "@nestjs/swagger"

export enum TenantStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  CANCELLED = "cancelled",
}

export class CreateTenantDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  domain?: string

  @ApiProperty({ enum: TenantStatus, default: TenantStatus.ACTIVE })
  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>
}

export class UpdateTenantDto extends PartialType(CreateTenantDto) {}

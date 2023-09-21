import { IsString, IsOptional, IsEnum, IsDateString, IsArray, IsUUID } from "class-validator"
import { ApiProperty, PartialType } from "@nestjs/swagger"

export enum ProjectStatus {
  PLANNING = "planning",
  IN_PROGRESS = "in_progress",
  ON_HOLD = "on_hold",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum ProjectPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ enum: ProjectStatus, default: ProjectStatus.PLANNING })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus

  @ApiProperty({ enum: ProjectPriority, default: ProjectPriority.MEDIUM })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  start_date?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  end_date?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  manager_id?: string

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  team_member_ids?: string[]
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

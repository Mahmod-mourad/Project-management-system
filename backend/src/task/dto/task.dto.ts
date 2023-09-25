import { IsString, IsOptional, IsEnum, IsDateString, IsUUID } from "class-validator"
import { ApiProperty, PartialType } from "@nestjs/swagger"

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  IN_REVIEW = "in_review",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ enum: TaskStatus, default: TaskStatus.TODO })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @ApiProperty({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  project_id?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  assignee_id?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  due_date?: string
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

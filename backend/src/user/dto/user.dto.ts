import { IsString, IsOptional, IsEmail } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  full_name?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatar_url?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  department?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  role?: string
}

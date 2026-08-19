import { IsString, IsOptional, IsEmail, IsEnum, MinLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

/** The roles a user can hold inside a tenant. Matches the check constraint on profiles.role. */
export enum TenantRole {
  ADMIN = "admin",
  MANAGER = "manager",
  MEMBER = "member",
}

/**
 * Creating a user inside the caller's tenant.
 *
 * There is deliberately no tenant_id here. This used to be RegisterDto on the
 * public /auth/register route, where the caller named the tenant they were
 * joining — so anyone holding a tenant id could put an account inside someone
 * else's company. The tenant now comes from the authenticated administrator
 * making the request.
 */
export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string

  @ApiProperty()
  @IsString()
  full_name: string

  @ApiProperty({ enum: TenantRole, default: TenantRole.MEMBER, required: false })
  @IsOptional()
  @IsEnum(TenantRole)
  role?: TenantRole

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  department?: string
}

/**
 * Editing a user.
 *
 * `role` is here because administrators change it from the users screen, but the
 * controller drops it for anyone who is not an administrator. Sending it as an
 * ordinary member used to be enough to become one.
 */
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

  @ApiProperty({ enum: TenantRole, required: false })
  @IsOptional()
  @IsEnum(TenantRole)
  role?: TenantRole
}

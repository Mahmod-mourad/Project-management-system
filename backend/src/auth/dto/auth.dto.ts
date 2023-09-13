import { IsEmail, IsString, MinLength, IsUUID } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string
}

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string

  @ApiProperty()
  @IsString()
  full_name: string

  @ApiProperty()
  @IsUUID()
  tenant_id: string
}

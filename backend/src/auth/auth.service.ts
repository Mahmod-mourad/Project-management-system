import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { SupabaseService } from "../supabase/supabase.service"
import { LoginDto, RegisterDto } from "./dto/auth.dto"

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private supabaseService: SupabaseService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, full_name, tenant_id } = registerDto

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await this.supabaseService.client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        tenant_id,
      },
    })

    if (authError) {
      throw new BadRequestException(authError.message)
    }

    // Create user profile
    const { data: profile, error: profileError } = await this.supabaseService.client
      .from("profiles")
      .insert({
        id: authData.user.id,
        email,
        full_name,
        tenant_id,
      })
      .select()
      .single()

    if (profileError) {
      // Cleanup auth user if profile creation fails
      await this.supabaseService.client.auth.admin.deleteUser(authData.user.id)
      throw new BadRequestException("Failed to create user profile")
    }

    // Generate JWT token
    const payload = {
      sub: authData.user.id,
      email: authData.user.email,
      tenant_id,
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name,
        tenant_id,
      },
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto

    // Authenticate with Supabase
    const { data: authData, error: authError } = await this.supabaseService.client.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      throw new UnauthorizedException("Invalid credentials")
    }

    // Get user profile
    const { data: profile, error: profileError } = await this.supabaseService.client
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (profileError) {
      throw new UnauthorizedException("User profile not found")
    }

    // Generate JWT token
    const payload = {
      sub: authData.user.id,
      email: authData.user.email,
      tenant_id: profile.tenant_id,
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: profile.full_name,
        tenant_id: profile.tenant_id,
      },
    }
  }

  async validateUser(userId: string) {
    const { data: profile, error } = await this.supabaseService.client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error || !profile) {
      throw new UnauthorizedException("User not found")
    }

    return profile
  }

  async refreshToken(userId: string) {
    const profile = await this.validateUser(userId)

    const payload = {
      sub: profile.id,
      email: profile.email,
      tenant_id: profile.tenant_id,
    }

    return {
      access_token: this.jwtService.sign(payload),
    }
  }

  async logout(userId: string) {
    // Invalidate Supabase session
    await this.supabaseService.client.auth.admin.signOut(userId)

    return { message: "Logged out successfully" }
  }
}

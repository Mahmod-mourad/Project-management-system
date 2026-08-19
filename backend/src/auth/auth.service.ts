import { Injectable, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { SupabaseService } from "../supabase/supabase.service"
import { LoginDto } from "./dto/auth.dto"

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private supabaseService: SupabaseService,
  ) {}


  async login(loginDto: LoginDto) {
    const { email, password } = loginDto

    // Deliberately not the shared client: signInWithPassword would leave the
    // caller's session on it, and every query the API made afterwards would go
    // out as that user rather than as the service role.
    const { data: authData, error: authError } = await this.supabaseService
      .createAuthClient()
      .auth.signInWithPassword({ email, password })

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
        // The UI hides administrator-only actions on these two. Sending them
        // saves the client a second round trip just to draw its own menu; the
        // API still checks both itself on every request.
        role: profile.role,
        is_platform_admin: profile.is_platform_admin ?? false,
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

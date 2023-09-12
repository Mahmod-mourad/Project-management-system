import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy } from "passport-custom"
import type { SupabaseService } from "../../supabase/supabase.service"

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, "supabase") {
  constructor(private supabaseService: SupabaseService) {
    super()
  }

  async validate(req: any): Promise<any> {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      throw new UnauthorizedException("No authorization header")
    }

    const token = authHeader.replace("Bearer ", "")

    const {
      data: { user },
      error,
    } = await this.supabaseService.client.auth.getUser(token)

    if (error || !user) {
      throw new UnauthorizedException("Invalid token")
    }

    // Get user profile
    const { data: profile } = await this.supabaseService.client.from("profiles").select("*").eq("id", user.id).single()

    return profile || user
  }
}

import { Injectable, type OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL")
    const supabaseServiceKey = this.configService.get<string>("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration is missing")
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  get client(): SupabaseClient {
    return this.supabase
  }

  /**
   * A throwaway client for verifying a password.
   *
   * signInWithPassword stores the session on the client it is called on, and
   * every later request from that client goes out with the signed-in user's
   * token instead of the service role key. Calling it on the shared client
   * therefore downgrades the whole application to whatever that user can do —
   * which, with row level security on and no policies, is nothing.
   *
   * That is why the profile lookup straight after a successful sign-in returned
   * no rows and the API answered "User profile not found" for correct
   * credentials. This client is used for the one call and dropped.
   */
  createAuthClient(): SupabaseClient {
    return createClient(
      this.configService.getOrThrow<string>("SUPABASE_URL"),
      this.configService.getOrThrow<string>("SUPABASE_SERVICE_ROLE_KEY"),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )
  }

}

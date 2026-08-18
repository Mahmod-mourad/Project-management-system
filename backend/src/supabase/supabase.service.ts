import { Injectable, type OnModuleInit } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
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

  // Helper method to create tenant-scoped client
  createTenantClient(tenantId: string): SupabaseClient {
    return createClient(
      this.configService.get<string>("SUPABASE_URL")!,
      this.configService.get<string>("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            "x-tenant-id": tenantId,
          },
        },
      },
    )
  }

}

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

  // Helper method for RLS-enabled queries
  async withRLS<T>(userId: string, tenantId: string, operation: (client: SupabaseClient) => Promise<T>): Promise<T> {
    const client = createClient(
      this.configService.get<string>("SUPABASE_URL")!,
      this.configService.get<string>("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${await this.generateUserToken(userId)}`,
            "x-tenant-id": tenantId,
          },
        },
      },
    )

    return operation(client)
  }

  private async generateUserToken(userId: string): Promise<string> {
    // Generate JWT token for user authentication
    const { data, error } = await this.supabase.auth.admin.generateLink({
      type: "magiclink",
      email: `user-${userId}@temp.com`,
    })

    if (error) throw error
    return data.properties?.access_token || ""
  }
}

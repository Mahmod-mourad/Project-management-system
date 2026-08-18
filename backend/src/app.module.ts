import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { AuthModule } from "./auth/auth.module"
import { TenantModule } from "./tenant/tenant.module"
import { UserModule } from "./user/user.module"
import { ProjectModule } from "./project/project.module"
import { TaskModule } from "./task/task.module"
import { NotificationModule } from "./notification/notification.module"
import { SupabaseModule } from "./supabase/supabase.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    SupabaseModule,
    AuthModule,
    TenantModule,
    UserModule,
    ProjectModule,
    TaskModule,
    NotificationModule,
  ],
})
export class AppModule {}

import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"

import { SupabaseModule } from "../supabase/supabase.module"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { JwtStrategy } from "./strategies/jwt.strategy"
import { SupabaseStrategy } from "./strategies/supabase.strategy"

@Module({
  imports: [
    SupabaseModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRES_IN", "7d"),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SupabaseStrategy],
  // JwtModule is exported so the notification gateway can verify the token on a
  // socket handshake. Registering it a second time there would configure a second
  // signing secret and let the two disagree.
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}

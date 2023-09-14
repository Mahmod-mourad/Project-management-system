import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { ConfigService } from "@nestjs/config"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { JwtStrategy } from "./strategies/jwt.strategy"
import { SupabaseStrategy } from "./strategies/supabase.strategy"

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),\
        },```ts file="backend/src/auth/auth.module.ts"\
import { Module } from '@nestjs/common\';\
import { JwtModule } from \'@nestjs/jwt\';\
import { PassportModule } from \'@nestjs/passport\';\
import { ConfigService } from \'@nestjs/config\';\
import { AuthController } from \'./auth.controller\';\
import { AuthService } from \'./auth.service\';\
import { JwtStrategy } from \'./strategies/jwt.strategy\';\
import { SupabaseStrategy } from \'./strategies/supabase.strategy\';
\
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SupabaseStrategy],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}\

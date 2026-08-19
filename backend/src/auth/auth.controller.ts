import { Body, Controller, Post, UseGuards, Get, Request } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"
import { AuthService } from "./auth.service"
import { LoginDto, RegisterDto } from "./dto/auth.dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"

interface AuthenticatedRequest {
  user: {
    id: string
    [key: string]: unknown
  }
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto)
  }

  @Post("login")
  @ApiOperation({ summary: "Login user" })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Request() req: AuthenticatedRequest) {
    return this.authService.refreshToken(req.user.id);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  logout(@Request() req: AuthenticatedRequest) {
    return this.authService.logout(req.user.id);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }
}

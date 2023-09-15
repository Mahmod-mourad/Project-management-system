import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { SupabaseService } from '../supabase/supabase.service'
import { JwtService } from '@nestjs/jwt'
import { UnauthorizedException, BadRequestException } from '@nestjs/common'

describe('AuthService', () => {
  let service: AuthService
  let supabaseService: SupabaseService
  let jwtService: JwtService

  const mockSupabaseService = {
    getClient: jest.fn(),
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
  }

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    supabaseService = module.get<SupabaseService>(SupabaseService)
    jwtService = module.get<JwtService>(JwtService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('signup', () => {
    it('should register a new user successfully', async () => {
      const signupDto = {
        email: 'test@example.com',
        password: 'SecurePassword123',
        full_name: 'Test User',
        tenant_id: 'tenant-123',
      }

      const mockResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          user_metadata: { full_name: 'Test User' },
        },
      }

      mockSupabaseService.signUp.mockResolvedValue(mockResponse)
      mockJwtService.sign.mockReturnValue('test-jwt-token')

      const result = await service.signup(signupDto)

      expect(mockSupabaseService.signUp).toHaveBeenCalledWith({
        email: signupDto.email,
        password: signupDto.password,
        options: {
          data: {
            full_name: signupDto.full_name,
            tenant_id: signupDto.tenant_id,
          },
        },
      })
      expect(result).toHaveProperty('access_token')
    })

    it('should throw error if email already exists', async () => {
      const signupDto = {
        email: 'existing@example.com',
        password: 'SecurePassword123',
        full_name: 'Test User',
        tenant_id: 'tenant-123',
      }

      mockSupabaseService.signUp.mockRejectedValue(new Error('User already exists'))

      await expect(service.signup(signupDto)).rejects.toThrow()
    })
  })

  describe('login', () => {
    it('should authenticate user and return token', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'SecurePassword123',
      }

      const mockResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
        },
        session: {
          access_token: 'supabase-token',
        },
      }

      mockSupabaseService.signIn.mockResolvedValue(mockResponse)
      mockJwtService.sign.mockReturnValue('test-jwt-token')

      const result = await service.login(loginDto)

      expect(mockSupabaseService.signIn).toHaveBeenCalledWith({
        email: loginDto.email,
        password: loginDto.password,
      })
      expect(result).toHaveProperty('access_token')
    })

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      }

      mockSupabaseService.signIn.mockRejectedValue(new Error('Invalid login credentials'))

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('validateUser', () => {
    it('should validate JWT token and return user', async () => {
      const token = 'valid-jwt-token'
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
      }

      mockJwtService.verify.mockReturnValue({ sub: '123' })
      mockSupabaseService.getUser.mockResolvedValue(mockUser)

      const result = await service.validateUser(token)

      expect(result).toEqual(expect.objectContaining({ id: '123' }))
    })

    it('should throw on invalid token', async () => {
      const token = 'invalid-jwt-token'

      mockJwtService.verify.mockThrow(new Error('Invalid token'))

      await expect(service.validateUser(token)).rejects.toThrow()
    })
  })

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const token = 'valid-jwt-token'

      mockSupabaseService.signOut.mockResolvedValue({})

      await expect(service.logout(token)).resolves.not.toThrow()
    })
  })
})

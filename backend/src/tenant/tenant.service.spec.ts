import { Test, TestingModule } from '@nestjs/testing'
import { TenantService } from './tenant.service'
import { SupabaseService } from '../supabase/supabase.service'
import { BadRequestException, NotFoundException } from '@nestjs/common'

describe('TenantService', () => {
  let service: TenantService
  let supabaseService: SupabaseService

  const mockSupabaseService = {
    getClient: jest.fn(),
    query: jest.fn(),
  }

  const mockTenant = {
    id: 'tenant-123',
    name: 'Test Company',
    subdomain: 'test-company',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile()

    service = module.get<TenantService>(TenantService)
    supabaseService = module.get<SupabaseService>(SupabaseService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create a new tenant', async () => {
      const createTenantDto = {
        name: 'New Company',
        subdomain: 'new-company',
      }

      mockSupabaseService.query.mockResolvedValue({
        data: [mockTenant],
        error: null,
      })

      const result = await service.create(createTenantDto)

      expect(mockSupabaseService.query).toHaveBeenCalled()
      expect(result).toHaveProperty('id')
    })

    it('should throw error if subdomain already exists', async () => {
      const createTenantDto = {
        name: 'Duplicate Company',
        subdomain: 'existing-company',
      }

      mockSupabaseService.query.mockResolvedValue({
        data: null,
        error: new Error('Unique constraint violated'),
      })

      await expect(service.create(createTenantDto)).rejects.toThrow()
    })
  })

  describe('findAll', () => {
    it('should return all tenants', async () => {
      const tenants = [mockTenant, { ...mockTenant, id: 'tenant-456', name: 'Company 2' }]

      mockSupabaseService.query.mockResolvedValue({
        data: tenants,
        error: null,
      })

      const result = await service.findAll()

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(mockTenant)
    })
  })

  describe('findOne', () => {
    it('should return a specific tenant', async () => {
      mockSupabaseService.query.mockResolvedValue({
        data: [mockTenant],
        error: null,
      })

      const result = await service.findOne('tenant-123')

      expect(result).toEqual(mockTenant)
    })

    it('should throw NotFoundException if tenant does not exist', async () => {
      mockSupabaseService.query.mockResolvedValue({
        data: [],
        error: null,
      })

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('should update a tenant', async () => {
      const updateTenantDto = {
        name: 'Updated Company Name',
      }

      const updatedTenant = { ...mockTenant, ...updateTenantDto }

      mockSupabaseService.query.mockResolvedValue({
        data: [updatedTenant],
        error: null,
      })

      const result = await service.update('tenant-123', updateTenantDto)

      expect(result).toHaveProperty('name', 'Updated Company Name')
    })

    it('should throw error if tenant not found on update', async () => {
      mockSupabaseService.query.mockResolvedValue({
        data: [],
        error: new Error('Not found'),
      })

      await expect(service.update('non-existent-id', { name: 'New Name' })).rejects.toThrow()
    })
  })

  describe('remove', () => {
    it('should remove a tenant', async () => {
      mockSupabaseService.query.mockResolvedValue({
        data: [{ ...mockTenant, status: 'deleted' }],
        error: null,
      })

      await expect(service.remove('tenant-123')).resolves.not.toThrow()
    })

    it('should throw NotFoundException if tenant not found on delete', async () => {
      mockSupabaseService.query.mockResolvedValue({
        data: [],
        error: new Error('Not found'),
      })

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('getTenantBySubdomain', () => {
    it('should return tenant by subdomain', async () => {
      mockSupabaseService.query.mockResolvedValue({
        data: [mockTenant],
        error: null,
      })

      const result = await service.getTenantBySubdomain('test-company')

      expect(result).toEqual(mockTenant)
    })

    it('should throw NotFoundException if subdomain not found', async () => {
      mockSupabaseService.query.mockResolvedValue({
        data: [],
        error: null,
      })

      await expect(service.getTenantBySubdomain('non-existent')).rejects.toThrow(NotFoundException)
    })
  })
})

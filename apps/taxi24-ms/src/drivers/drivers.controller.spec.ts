import { Test, TestingModule } from '@nestjs/testing'
import { DriversController } from './drivers.controller'
import { DriversService } from './drivers.service'
import { DrivesQueryDto } from '@app/libs/drivers/dto/drivers.dto'
import { DriverStatus } from '@app/libs/drivers/enums/driver.enum'
import { Paginated } from '@app/libs/common/pagination/interfaces/pagination.interface'
import { Driver, DriverDocument } from './entities/driver.entity'
import { RpcException } from '@nestjs/microservices'
import { HttpStatus } from '@nestjs/common'

describe('DriversController', () => {
	let controller: DriversController
	let service: DriversService

	const mockDriver = {
		_id: '1',
		id: '1',
		name: 'Test Name',
		lastName: 'Test LastName',
		lastCoordinates: {
			type: 'Point',
			coordinates: [0, 0]
		},
		status: DriverStatus.AVAILABLE,
		createdAt: new Date('2025-11-01'),
		updatedAt: new Date('2025-11-01')
	} as Partial<Driver> & { _id: string }

	const mockDriverPaginated: Paginated<DriverDocument> = {
		items: [mockDriver as unknown as DriverDocument],
		totalRecords: 1,
		totalPages: 1,
		hasNextPage: false
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [DriversController],
			providers: [
				{
					provide: DriversService,
					useValue: {
						getAllWithPagination: jest.fn(),
						getNearbyWithPagination: jest.fn(),
						findOne: jest.fn()
					}
				}
			]
		}).compile()

		controller = module.get<DriversController>(DriversController)
		service = module.get<DriversService>(DriversService)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	describe('getAllWithPagination', () => {
		it('should call service with query parameters', async () => {
			const query: DrivesQueryDto = {
				page: 1,
				limit: 10,
				status: DriverStatus.AVAILABLE,
				lat: 40.7128,
				lon: -74.006,
				maxDistance: 10
			}

			jest
				.spyOn(service, 'getAllWithPagination')
				.mockResolvedValue(mockDriverPaginated)

			const result = await controller.getAllWithPagination(query)

			expect(result).toEqual(mockDriverPaginated)
			expect(service.getAllWithPagination).toHaveBeenCalledWith(query)
		})

		it('should handle service errors', async () => {
			const query: DrivesQueryDto = { limit: 10 }
			const error = new Error('Test error')

			jest.spyOn(service, 'getAllWithPagination').mockRejectedValue(error)

			await expect(controller.getAllWithPagination(query)).rejects.toThrow(
				'Test error'
			)
		})

		it('should work with minimal query parameters', async () => {
			const query: DrivesQueryDto = {}

			jest
				.spyOn(service, 'getAllWithPagination')
				.mockResolvedValue(mockDriverPaginated)

			const result = await controller.getAllWithPagination(query)

			expect(result).toEqual(mockDriverPaginated)
			expect(service.getAllWithPagination).toHaveBeenCalledWith({})
		})
	})

	describe('getNearbyWithPagination', () => {
		it('should call service with query parameters', async () => {
			const query: DrivesQueryDto = {
				lat: 40.7128,
				lon: -74.006,
				maxDistance: 10,
				limit: 10,
				page: 1
			}

			jest
				.spyOn(service, 'getNearbyWithPagination')
				.mockResolvedValue(mockDriverPaginated)

			const result = await controller.getNearbyWithPagination(query)

			expect(result).toEqual(mockDriverPaginated)
			expect(service.getNearbyWithPagination).toHaveBeenCalledWith(query)
		})

		it('should handle service errors', async () => {
			const query: DrivesQueryDto = {
				lat: 40.7128,
				lon: -74.006,
				maxDistance: 10,
				limit: 10,
				page: 1
			}
			const error = new Error('Test error')

			jest.spyOn(service, 'getNearbyWithPagination').mockRejectedValue(error)

			await expect(controller.getNearbyWithPagination(query)).rejects.toThrow(
				'Test error'
			)
		})
	})

	describe('findOne', () => {
		it('should call service with valid ID', async () => {
			const id = '507f1f77bcf86cd799439011'

			jest.spyOn(service, 'findOne').mockResolvedValue(mockDriver as any)

			const result = await controller.findOne({ id })

			expect(result).toEqual(mockDriver)
			expect(service.findOne).toHaveBeenCalledWith(id)
		})

		it('should throw RpcCustomException when driver not found', async () => {
			const id = '507f1f77bcf86cd799439011'

			jest.spyOn(service, 'findOne').mockRejectedValue(
				new RpcException({
					statusCode: HttpStatus.NOT_FOUND,
					error: 'not found',
					message: 'Driver not found'
				})
			)

			await expect(controller.findOne({ id })).rejects.toThrow(RpcException)
			await expect(controller.findOne({ id })).rejects.toThrow(
				'Driver not found'
			)
		})

		it('should handle service errors', async () => {
			const id = '507f1f77bcf86cd799439011'
			const error = new Error('Bad request')

			jest.spyOn(service, 'findOne').mockRejectedValue(error)

			await expect(controller.findOne({ id })).rejects.toThrow('Bad request')
		})
	})

	describe('DTO validation', () => {
		it('should accept valid DriverIdDto', () => {
			const validId = { id: '507f1f77bcf86cd799439011' }
			expect(() => controller.findOne(validId)).not.toThrow()
		})

		it('should accept valid DrivesQueryDto', async () => {
			const validQuery: DrivesQueryDto = {
				page: 1,
				limit: 10,
				status: DriverStatus.AVAILABLE,
				lat: 40.7128,
				lon: -74.006,
				maxDistance: 10
			}

			jest
				.spyOn(service, 'getAllWithPagination')
				.mockResolvedValue(mockDriverPaginated)

			await expect(
				controller.getAllWithPagination(validQuery)
			).resolves.toBeDefined()
		})
	})
})

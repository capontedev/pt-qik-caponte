import { Test, TestingModule } from '@nestjs/testing'
import { PassengersController } from './passengers.controller'
import { PassengersService } from './passengers.service'
import { HttpException } from '@nestjs/common'
import { PassengersQueryDto } from './dto/passenger.dto'
import { PassengerStatus } from './enums/passenger.enum'
import { Paginated } from 'src/common/pagination/interfaces/pagination.interface'
import { Passenger, PassengerDocument } from './entities/passenger.entity'

describe('PassengersController', () => {
	let controller: PassengersController
	let service: PassengersService

	const mockPassenger = {
		_id: '1',
		id: '1',
		name: 'Test Name',
		lastName: 'Test LastName',
		status: PassengerStatus.AVAILABLE,
		createdAt: new Date('2025-11-01'),
		updatedAt: new Date('2025-11-01')
	} as Partial<Passenger> & { _id: string }

	const mockPassengerPaginated: Paginated<PassengerDocument> = {
		items: [mockPassenger as unknown as PassengerDocument],
		totalRecords: 1,
		totalPages: 1,
		hasNextPage: false
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [PassengersController],
			providers: [
				{
					provide: PassengersService,
					useValue: {
						getAllWithPagination: jest.fn(),
						findOne: jest.fn()
					}
				}
			]
		}).compile()

		controller = module.get<PassengersController>(PassengersController)
		service = module.get<PassengersService>(PassengersService)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})

	describe('getAllWithPagination', () => {
		it('should call service with query parameters', async () => {
			const query: PassengersQueryDto = {
				page: 1,
				limit: 10
			}

			jest
				.spyOn(service, 'getAllWithPagination')
				.mockResolvedValue(mockPassengerPaginated)

			const result = await controller.getAllWithPagination(query)

			expect(result).toEqual(mockPassengerPaginated)
			expect(service.getAllWithPagination).toHaveBeenCalledWith(query)
		})

		it('should handle service errors', async () => {
			const query: PassengersQueryDto = { limit: 10 }
			const error = new Error('Test error')

			jest.spyOn(service, 'getAllWithPagination').mockRejectedValue(error)

			await expect(controller.getAllWithPagination(query)).rejects.toThrow(
				'Test error'
			)
		})

		it('should work with minimal query parameters', async () => {
			const query: PassengersQueryDto = {}

			jest
				.spyOn(service, 'getAllWithPagination')
				.mockResolvedValue(mockPassengerPaginated)

			const result = await controller.getAllWithPagination(query)

			expect(result).toEqual(mockPassengerPaginated)
			expect(service.getAllWithPagination).toHaveBeenCalledWith({})
		})
	})

	describe('findOne', () => {
		it('should call service with valid ID', async () => {
			const id = '507f1f77bcf86cd799439011'

			jest.spyOn(service, 'findOne').mockResolvedValue(mockPassenger as any)

			const result = await controller.findOne({ id })

			expect(result).toEqual(mockPassenger)
			expect(service.findOne).toHaveBeenCalledWith(id)
		})

		it('should throw HttpException when passenger not found', async () => {
			const id = '507f1f77bcf86cd799439011'

			jest
				.spyOn(service, 'findOne')
				.mockRejectedValue(new HttpException('Passenger not found', 404))

			await expect(controller.findOne({ id })).rejects.toThrow(HttpException)
			await expect(controller.findOne({ id })).rejects.toThrow(
				'Passenger not found'
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
		it('should accept valid PassengersQueryDto', () => {
			const validId = { id: '507f1f77bcf86cd799439011' }
			expect(() => controller.findOne(validId)).not.toThrow()
		})

		it('should accept valid PassengersQueryDto', async () => {
			const validQuery: PassengersQueryDto = {
				page: 1,
				limit: 10
			}

			jest
				.spyOn(service, 'getAllWithPagination')
				.mockResolvedValue(mockPassengerPaginated)

			await expect(
				controller.getAllWithPagination(validQuery)
			).resolves.toBeDefined()
		})
	})
})

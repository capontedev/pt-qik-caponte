import { Test, TestingModule } from '@nestjs/testing'
import { TripsController } from './trips.controller'
import { TripsService } from './trips.service'
import { Driver } from './../drivers/entities/driver.entity'
import { Types } from 'mongoose'
import { DriverStatus } from './../drivers/enums/driver.enum'
import { TripStatus } from './enums/trip.enum'
import { TripDocument } from './entities/trip.entity'
import { Paginated } from './../common/pagination/interfaces/pagination.interface'
import { Passenger } from './../passengers/entities/passenger.entity'
import { TripsQueryDto } from './dto/trip.dto'
import { PaymentType } from './../common/enums/payment-type.enum'

describe('TripsController', () => {
	let controller: TripsController
	let service: TripsService

	const mockDriver = {
		_id: '507f1f77bcf86cd799439011',
		name: 'Test Driver',
		status: DriverStatus.AVAILABLE,
		save: jest.fn()
	} as Partial<Driver> & { _id: string; save: jest.Mock }

	const mockPassenger = {
		_id: '507f1f77bcf86cd799439012',
		name: 'Test Trip',
		save: jest.fn()
	} as Partial<Passenger> & { _id: string; save: jest.Mock }

	const mockTrip = {
		_id: '507f1f77bcf86cd799439013',
		driver: new Types.ObjectId(mockDriver._id),
		passenger: new Types.ObjectId(mockPassenger._id),
		startCoordinates: {
			type: 'Point',
			coordinates: [-66.9036, 10.5061]
		},
		destinationCoordinates: {
			type: 'Point',
			coordinates: [-66.9005, 10.5092]
		},
		status: TripStatus.ACTIVE,
		createdAt: new Date('2025-11-01'),
		updatedAt: new Date('2025-11-01'),
		save: jest.fn().mockResolvedValue(undefined)
	} as any

	const mockTripPaginated: Paginated<TripDocument> = {
		items: [mockTrip as unknown as TripDocument],
		totalRecords: 1,
		totalPages: 1,
		hasNextPage: false
	}

	const createTripDto = {
		driverId: mockDriver._id,
		passengerId: mockPassenger._id,
		startCoordinates: [-66.9036, 10.5061] as [number, number],
		destinationCoordinates: [-66.9005, 10.5092] as [number, number],
		paymentType: PaymentType.CASH
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [TripsController],
			providers: [
				{
					provide: TripsService,
					useValue: {
						getAllWithPagination: jest.fn(),
						completeTrip: jest.fn(),
						create: jest.fn()
					}
				}
			]
		}).compile()

		controller = module.get<TripsController>(TripsController)
		service = module.get<TripsService>(TripsService)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})

	describe('getAllWithPagination', () => {
		it('should call service with query parameters', async () => {
			const query: TripsQueryDto = {
				page: 1,
				limit: 10
			}

			jest
				.spyOn(service, 'getAllWithPagination')
				.mockResolvedValue(mockTripPaginated)

			const result = await controller.getAllWithPagination(query)

			expect(result).toEqual(mockTripPaginated)
			expect(service.getAllWithPagination).toHaveBeenCalledWith(query)
		})

		it('should handle service errors', async () => {
			const query: TripsQueryDto = { limit: 10 }
			const error = new Error('Test error')

			jest.spyOn(service, 'getAllWithPagination').mockRejectedValue(error)

			await expect(controller.getAllWithPagination(query)).rejects.toThrow(
				'Test error'
			)
		})

		it('should work with minimal query parameters', async () => {
			const query: TripsQueryDto = {}

			jest
				.spyOn(service, 'getAllWithPagination')
				.mockResolvedValue(mockTripPaginated)

			const result = await controller.getAllWithPagination(query)

			expect(result).toEqual(mockTripPaginated)
			expect(service.getAllWithPagination).toHaveBeenCalledWith({})
		})
	})

	describe('create', () => {
		it('should call service.create and return the created trip', async () => {
			const createdTrip = { ...mockTrip }
			jest.spyOn(service, 'create').mockResolvedValue(createdTrip)

			const result = await controller.create(createTripDto)

			expect(service.create).toHaveBeenCalledWith(createTripDto)
			expect(result).toEqual(createdTrip)
		})

		it('should handle service errors', async () => {
			const error = new Error('Create error')
			jest.spyOn(service, 'create').mockRejectedValue(error)

			await expect(controller.create(createTripDto)).rejects.toThrow(
				'Create error'
			)
		})
	})

	describe('completeTrip', () => {
		it('should call service.completeTrip and return the completed trip', async () => {
			const params = { id: mockTrip._id }
			const completedTrip = { ...mockTrip, status: TripStatus.COMPLETED }
			jest.spyOn(service, 'completeTrip').mockResolvedValue(completedTrip)

			const result = await controller.completeTrip(params)

			expect(service.completeTrip).toHaveBeenCalledWith(params.id)
			expect(result).toEqual(completedTrip)
		})

		it('should handle service errors', async () => {
			const params = { id: mockTrip._id }
			const error = new Error('Complete error')
			jest.spyOn(service, 'completeTrip').mockRejectedValue(error)

			await expect(controller.completeTrip(params)).rejects.toThrow(
				'Complete error'
			)
		})
	})
})

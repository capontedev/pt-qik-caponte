import { HttpException, HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { TripsService } from './trips.service'
import { Trip, TripDocument } from './entities/trip.entity'
import { TripStatus } from './enums/trip.enum'
import { TripsQueryDto } from './dto/trip.dto'
import { DriversService } from './../drivers/drivers.service'
import { PassengersService } from './../passengers/passengers.service'
import { PaymentType } from './../common/enums/payment-type.enum'
import { CreateTripDto } from './dto/create-trip.dto'
import { DriverStatus } from './../drivers/enums/driver.enum'
import { Paginated } from './../common/pagination/interfaces/pagination.interface'
import { Driver } from './../drivers/entities/driver.entity'
import { Passenger } from './../passengers/entities/passenger.entity'
import { PassengerStatus } from './../passengers/enums/passenger.enum'

jest.mock('../common/pagination/pagination')
import * as paginationModule from '../common/pagination/pagination'

describe('TripsService', () => {
	let service: TripsService
	let model: jest.Mocked<Model<TripDocument>>
	let driversService: DriversService
	let passengersService: PassengersService

	const mockDriver = {
		_id: '507f1f77bcf86cd799439011',
		name: 'Test Driver',
		status: DriverStatus.AVAILABLE,
		save: jest.fn()
	} as Partial<Driver> & { _id: string; save: jest.Mock }

	const mockPassenger = {
		_id: '507f1f77bcf86cd799439012',
		name: 'Test Passenger',
		status: PassengerStatus.AVAILABLE,
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

	const mockTripModel = jest.fn().mockImplementation(() => mockTrip)
	mockTripModel.prototype.find = jest.fn()
	mockTripModel.prototype.findById = jest.fn()
	mockTripModel.prototype.aggregate = jest.fn()
	mockTripModel.prototype.countDocuments = jest.fn()
	mockTripModel.prototype.sort = jest.fn()

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TripsService,
				{
					provide: getModelToken(Trip.name),
					useValue: mockTripModel
				},
				{
					provide: DriversService,
					useValue: {
						findOne: jest.fn().mockResolvedValue(mockDriver)
					}
				},
				{
					provide: PassengersService,
					useValue: {
						findOne: jest.fn().mockResolvedValue(mockPassenger)
					}
				}
			]
		}).compile()

		service = module.get<TripsService>(TripsService)
		model = module.get<jest.Mocked<Model<TripDocument>>>(
			getModelToken(Trip.name)
		)
		driversService = module.get<DriversService>(DriversService)
		passengersService = module.get<PassengersService>(PassengersService)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	describe('getAllWithPagination', () => {
		it('should return paginated trip without filter', async () => {
			const paginationMock = paginationModule.pagination as jest.Mock
			paginationMock.mockResolvedValueOnce(mockTripPaginated)

			const query: TripsQueryDto = {}
			const result = await service.getAllWithPagination(query)

			expect(paginationMock).toHaveBeenCalled()

			expect(result).toEqual(mockTripPaginated)
		})

		it('should apply status filter when are provided', async () => {
			const paginationMock = paginationModule.pagination as jest.Mock
			paginationMock.mockResolvedValueOnce(mockTripPaginated)

			const query: TripsQueryDto = {
				page: 1,
				limit: 10,
				status: TripStatus.ACTIVE
			}

			const result = await service.getAllWithPagination(query)

			expect(paginationMock).toHaveBeenCalledWith(model, {
				page: 1,
				limit: 10,
				filter: {
					status: TripStatus.ACTIVE
				},
				populate: ['driver', 'passenger']
			})

			expect(result).toEqual(mockTripPaginated)
		})

		it('should throw HttpException on error', async () => {
			const paginationMock = paginationModule.pagination as jest.Mock
			paginationMock.mockRejectedValueOnce(new Error('Test error'))

			const query: TripsQueryDto = {
				page: 1,
				limit: 10
			}

			await expect(service.getAllWithPagination(query)).rejects.toThrow(
				new HttpException('Test error', HttpStatus.BAD_REQUEST)
			)
		})
	})

	describe('create', () => {
		it('should create a new trip', async () => {
			const createTripDto: CreateTripDto = {
				driverId: mockDriver._id,
				passengerId: mockPassenger._id,
				startCoordinates: [-66.9036, 10.5061],
				destinationCoordinates: [-66.9005, 10.5092],
				paymentType: PaymentType.CASH
			}

			jest.spyOn(driversService, 'findOne').mockResolvedValue(mockDriver as any)
			jest
				.spyOn(passengersService, 'findOne')
				.mockResolvedValue(mockPassenger as any)
			mockTrip.save.mockResolvedValue(mockTrip)

			const result = await service.create(createTripDto)

			expect(result).toEqual(mockTrip)
			expect(driversService.findOne).toHaveBeenCalledWith(mockDriver._id)
			expect(passengersService.findOne).toHaveBeenCalledWith(mockPassenger._id)
			expect(mockTrip.save).toHaveBeenCalled()
		})
	})
})

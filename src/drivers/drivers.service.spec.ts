import { HttpException, HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { DriversService } from './drivers.service'
import { Driver, DriverDocument } from './entities/driver.entity'
import { DriverStatus } from './enums/driver.enum'
import { DrivesQueryDto } from './dto/drivers.dto'

jest.mock('../common/pagination/pagination')
import * as paginationModule from '../common/pagination/pagination'
import { Paginated } from 'src/common/pagination/interfaces/pagination.interface'

describe('DriversService', () => {
	let service: DriversService
	let model: Model<DriverDocument>

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

	const mockDriverModel = {
		aggregate: jest.fn(),
		find: jest.fn().mockReturnValue({
			forEach: jest.fn(),
			populate: jest.fn().mockReturnValue({
				exec: jest.fn().mockResolvedValue({})
			}),
			sort: jest.fn(),
			limit: jest.fn()
		}),
		countDocuments: jest.fn().mockResolvedValue(1),
		findById: jest.fn(),
		sort: jest.fn()
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DriversService,
				{
					provide: getModelToken(Driver.name),
					useValue: mockDriverModel
				}
			]
		}).compile()

		service = module.get<DriversService>(DriversService)
		model = module.get<Model<DriverDocument>>(getModelToken(Driver.name))
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	describe('getAllWithPagination', () => {
		it('should return paginated drivers without location filter', async () => {
			const paginationMock = paginationModule.pagination as jest.Mock
			paginationMock.mockResolvedValueOnce(mockDriverPaginated)

			const query: DrivesQueryDto = {}
			const result = await service.getAllWithPagination(query)

			expect(paginationMock).toHaveBeenCalled()

			expect(result).toEqual(mockDriverPaginated)
		})

		it('should apply location filter when lat and lon are provided', async () => {
			const paginationMock = paginationModule.pagination as jest.Mock
			paginationMock.mockResolvedValueOnce(mockDriverPaginated)

			const query: DrivesQueryDto = {
				page: 1,
				limit: 10,
				lat: 40.7128,
				lon: -74.006,
				maxDistance: 10
			}

			const result = await service.getAllWithPagination(query)

			expect(paginationMock).toHaveBeenCalledWith(model, {
				page: 1,
				limit: 10,
				filter: {
					lastCoordinates: {
						$geoWithin: {
							$centerSphere: [[-74.006, 40.7128], 10 / 6371]
						}
					},
					status: DriverStatus.AVAILABLE
				}
			})

			expect(result).toEqual(mockDriverPaginated)
		})

		it('should throw HttpException on error', async () => {
			const paginationMock = paginationModule.pagination as jest.Mock
			paginationMock.mockRejectedValueOnce(new Error('Test error'))

			const query: DrivesQueryDto = {
				page: 1,
				limit: 10
			}

			await expect(service.getAllWithPagination(query)).rejects.toThrow(
				new HttpException('Test error', HttpStatus.BAD_REQUEST)
			)
		})
	})

	describe('getNearbyWithPagination', () => {
		it('should return paginated drivers when valid coordinates and maxDistance are provided', async () => {
			const query: DrivesQueryDto = {
				lat: 10.5061,
				lon: -66.9036,
				maxDistance: 3,
				limit: 10,
				page: 1
			}

			mockDriverModel.aggregate.mockResolvedValue([
				{
					items: [mockDriver],
					totalRecords: 1
				}
			])

			const result = await service.getNearbyWithPagination(query)

			expect(model.aggregate).toHaveBeenCalled()
			expect(result).toEqual({
				items: [mockDriver],
				totalRecords: 1,
				hasNextPage: false,
				totalPages: 1
			})
		})

		it('should throw HttpException when lat, lon, and maxDistance are not provided together', async () => {
			const query: DrivesQueryDto = {
				lat: 10.5061
			}

			await expect(service.getNearbyWithPagination(query)).rejects.toThrow(
				new HttpException(
					'lat, lon, and max-distance must be provided together',
					HttpStatus.BAD_REQUEST
				)
			)
		})

		it('should throw HttpException when maxDistance is greater than 3', async () => {
			const query: DrivesQueryDto = {
				lat: 10.5061,
				lon: -66.9036,
				maxDistance: 5
			}

			await expect(service.getNearbyWithPagination(query)).rejects.toThrow(
				new HttpException(
					'max-distance must be less than 3 KM.',
					HttpStatus.BAD_REQUEST
				)
			)
		})

		it('should handle service errors', async () => {
			const query: DrivesQueryDto = {
				lat: 10.5061,
				lon: -66.9036,
				maxDistance: 3
			}

			mockDriverModel.aggregate.mockRejectedValue(new Error('Test error'))

			await expect(service.getNearbyWithPagination(query)).rejects.toThrow(
				new HttpException('Test error', HttpStatus.BAD_REQUEST)
			)
		})

		it('should return empty array when no drivers are found', async () => {
			const query: DrivesQueryDto = {
				lat: 10.5061,
				lon: -66.9036,
				maxDistance: 3
			}

			mockDriverModel.aggregate.mockResolvedValue([])

			const result = await service.getNearbyWithPagination(query)

			expect(result).toEqual({
				items: [],
				totalRecords: 0,
				hasNextPage: false,
				totalPages: 0
			})
		})
	})

	describe('findOne', () => {
		it('should return a driver when valid id is provided', async () => {
			mockDriverModel.findById.mockResolvedValue(mockDriver)

			const result = await service.findOne('1')

			expect(result).toEqual(mockDriver)
			expect(model.findById).toHaveBeenCalledWith('1')
		})

		it('should throw HttpException when driver not found', async () => {
			mockDriverModel.findById.mockResolvedValue(null)

			await expect(service.findOne('1')).rejects.toThrow(
				new HttpException('Driver not found', HttpStatus.NOT_FOUND)
			)
		})

		it('should throw HttpException on bad request', async () => {
			mockDriverModel.findById.mockRejectedValue(new Error('Bad request'))

			await expect(service.findOne('1')).rejects.toThrow(
				new HttpException('Bad request', HttpStatus.BAD_REQUEST)
			)
		})

		it('should throw BadRequestException for invalid id format', async () => {
			mockDriverModel.findById.mockRejectedValue(
				new Error('Cast to ObjectId failed')
			)

			await expect(service.findOne('invalid-id')).rejects.toThrow(
				new HttpException('Cast to ObjectId failed', HttpStatus.BAD_REQUEST)
			)
		})
	})
})

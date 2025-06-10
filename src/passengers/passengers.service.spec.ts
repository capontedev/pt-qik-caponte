import { HttpException, HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { PassengersService } from './passengers.service'
import { Passenger, PassengerDocument } from './entities/passenger.entity'
import { PassengerStatus } from './enums/passenger.enum'
import { PassengersQueryDto } from './dto/passenger.dto'

jest.mock('../common/pagination/pagination')
import * as paginationModule from '../common/pagination/pagination'
import { Paginated } from 'src/common/pagination/interfaces/pagination.interface'

describe('PassengersService', () => {
	let service: PassengersService
	let model: Model<PassengerDocument>

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

	const mockPassengerModel = {
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
				PassengersService,
				{
					provide: getModelToken(Passenger.name),
					useValue: mockPassengerModel
				}
			]
		}).compile()

		service = module.get<PassengersService>(PassengersService)
		model = module.get<Model<PassengerDocument>>(getModelToken(Passenger.name))
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	describe('getAllWithPagination', () => {
		it('should return paginated passenger without location filter', async () => {
			const paginationMock = paginationModule.pagination as jest.Mock
			paginationMock.mockResolvedValueOnce(mockPassengerPaginated)

			const query: PassengersQueryDto = {}
			const result = await service.getAllWithPagination(query)

			expect(paginationMock).toHaveBeenCalled()

			expect(result).toEqual(mockPassengerPaginated)
		})

		it('should throw HttpException on error', async () => {
			const paginationMock = paginationModule.pagination as jest.Mock
			paginationMock.mockRejectedValueOnce(new Error('Test error'))

			const query: PassengersQueryDto = {
				page: 1,
				limit: 10
			}

			await expect(service.getAllWithPagination(query)).rejects.toThrow(
				new HttpException('Test error', HttpStatus.BAD_REQUEST)
			)
		})
	})

	describe('findOne', () => {
		it('should return a passenger when valid id is provided', async () => {
			mockPassengerModel.findById.mockResolvedValue(mockPassenger)

			const result = await service.findOne('1')

			expect(result).toEqual(mockPassenger)
			expect(model.findById).toHaveBeenCalledWith('1')
		})

		it('should throw HttpException when passenger not found', async () => {
			mockPassengerModel.findById.mockResolvedValue(null)

			await expect(service.findOne('1')).rejects.toThrow(
				new HttpException('Passenger not found', HttpStatus.NOT_FOUND)
			)
		})

		it('should throw HttpException on bad request', async () => {
			mockPassengerModel.findById.mockRejectedValue(new Error('Bad request'))

			await expect(service.findOne('1')).rejects.toThrow(
				new HttpException('Bad request', HttpStatus.BAD_REQUEST)
			)
		})

		it('should throw BadRequestException for invalid id format', async () => {
			mockPassengerModel.findById.mockRejectedValue(
				new Error('Cast to ObjectId failed')
			)

			await expect(service.findOne('invalid-id')).rejects.toThrow(
				new HttpException('Cast to ObjectId failed', HttpStatus.BAD_REQUEST)
			)
		})
	})
})

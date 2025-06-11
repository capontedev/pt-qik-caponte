import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Paginated } from './../common/pagination/interfaces/pagination.interface'
import { Passenger, PassengerDocument } from './entities/passenger.entity'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { pagination } from './../common/pagination/pagination'
import { PassengersFilterDto, PassengersQueryDto } from './dto/passenger.dto'

@Injectable()
export class PassengersService {
	constructor(
		@InjectModel(Passenger.name)
		private passengerModel: Model<PassengerDocument>
	) {}

	async getAllWithPagination(
		query: PassengersQueryDto
	): Promise<Paginated<PassengerDocument>> {
		try {
			const { page, limit, ...restFilters } = query
			const queryFilter: PassengersFilterDto = { ...restFilters }

			return await pagination(this.passengerModel, {
				page,
				limit,
				filter: queryFilter
			})
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}

	async findOne(id: string) {
		try {
			const driver = await this.passengerModel.findById(id)

			if (!driver) {
				throw new HttpException('Passenger not found', HttpStatus.NOT_FOUND)
			}

			return driver
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}

			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}
}

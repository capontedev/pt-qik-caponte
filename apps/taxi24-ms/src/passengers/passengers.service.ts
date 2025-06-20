import { HttpStatus, Injectable } from '@nestjs/common'
import { Paginated } from '@app/libs/common/pagination/interfaces/pagination.interface'
import { Passenger, PassengerDocument } from './entities/passenger.entity'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { pagination } from '@app/libs/common/pagination/pagination'
import {
	PassengersFilterDto,
	PassengersQueryDto
} from '@app/libs/passengers/dto/passenger.dto'
import { RpcCustomException } from '../common/exceptions/rpc-custom-exception.filter'
import { RpcException } from '@nestjs/microservices'

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
			RpcCustomException({
				statusCode: HttpStatus.BAD_REQUEST,
				message: error.message
			})
		}
	}

	async findOne(id: string) {
		try {
			const driver = await this.passengerModel.findById(id)

			if (!driver) {
				RpcCustomException({
					statusCode: HttpStatus.NOT_FOUND,
					error: 'not found',
					message: 'Passenger not found'
				})
			}

			return driver
		} catch (error) {
			if (error instanceof RpcException) {
				throw error
			}

			RpcCustomException({
				statusCode: HttpStatus.BAD_REQUEST,
				message: error.message
			})
		}
	}
}

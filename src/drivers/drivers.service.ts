import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Paginated } from './../common/pagination/interfaces/pagination.interface'
import { Driver, DriverDocument } from './entities/driver.entity'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { pagination } from './../common/pagination/pagination'
import { DrivesFilterDto, DrivesQueryDto } from './dto/drivers.dto'
import { DriverStatus } from './enums/driver.enum'

@Injectable()
export class DriversService {
	constructor(
		@InjectModel(Driver.name)
		private driverModel: Model<DriverDocument>
	) {}

	async getAllWithPagination(
		query: DrivesQueryDto
	): Promise<Paginated<DriverDocument>> {
		try {
			const { limit, page, lat, lon, maxDistance = 3, ...restFilters } = query
			const queryFilter: DrivesFilterDto = { ...restFilters }

			if (lat && lon && maxDistance) {
				queryFilter.lastCoordinates = {
					$geoWithin: {
						$centerSphere: [[lon, lat], maxDistance / 6371]
					}
				}

				queryFilter.status = DriverStatus.AVAILABLE
			}

			return await pagination(this.driverModel, {
				limit,
				page,
				filter: queryFilter
			})
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}

	async findOne(id: string) {
		try {
			const driver = await this.driverModel.findById(id)

			if (!driver) {
				throw new HttpException('Driver not found', HttpStatus.NOT_FOUND)
			}

			return driver
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}
}

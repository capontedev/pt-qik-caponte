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

	async getNearbyWithPagination(
		query: DrivesQueryDto
	): Promise<Paginated<DriverDocument>> {
		try {
			const {
				limit = 3,
				page = 1,
				lat,
				lon,
				maxDistance = 3,
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				...restFilters
			} = query

			if (!lat || !lon || !maxDistance) {
				throw new HttpException(
					'lat, lon, and max-distance must be provided together',
					HttpStatus.BAD_REQUEST
				)
			}

			if (maxDistance > 3) {
				throw new HttpException(
					'max-distance must be less than 3 KM.',
					HttpStatus.BAD_REQUEST
				)
			}

			const skip = (page - 1) * limit

			const drivers = await this.driverModel.aggregate([
				{
					$geoNear: {
						near: {
							type: 'Point',
							coordinates: [lon, lat]
						},
						distanceField: 'distance',
						maxDistance: 3000,
						spherical: true
					}
				},
				{
					$addFields: {
						distance: { $divide: ['$distance', 1000] } // Convert to KM
					}
				},
				{
					$match: {
						status: DriverStatus.AVAILABLE
					}
				},
				{
					$facet: {
						totalCount: [
							{
								$count: 'count'
							}
						],
						items: [
							{
								$skip: skip
							},
							{
								$limit: limit
							}
						]
					}
				},
				{
					$project: {
						totalRecords: {
							$arrayElemAt: ['$totalCount.count', 0]
						},
						items: 1
					}
				}
			])

			if (drivers.length > 0) {
				const totalRecords = drivers[0].totalRecords || 0
				const hasNextPage =
					drivers[0].items.length === limit && skip + limit < totalRecords
				const totalPages = Math.ceil(totalRecords / limit)

				return {
					...drivers[0],
					hasNextPage,
					totalPages
				}
			}

			return {
				items: [],
				totalRecords: 0,
				hasNextPage: false,
				totalPages: 0
			}
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

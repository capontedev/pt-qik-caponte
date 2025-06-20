import { HttpStatus, Injectable } from '@nestjs/common'
import { CreateTripDto } from '@app/libs/trips/dto/create-trip.dto'
import { Trip, TripDocument } from './entities/trip.entity'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { DriversService } from './../drivers/drivers.service'
import { PassengersService } from './../passengers/passengers.service'
import { DriverStatus } from '@app/libs/drivers/enums/driver.enum'
import { TripStatus } from '@app/libs/trips/enums/trip.enum'
import { PassengerStatus } from '@app/libs/passengers/enums/passenger.enum'
import { getDistance } from 'geolib'
import { TripsFilterDto, TripsQueryDto } from '@app/libs/trips/dto/trip.dto'
import { Paginated } from '@app/libs/common/pagination/interfaces/pagination.interface'
import { pagination } from '@app/libs/common/pagination/pagination'
import { InvoicesService } from './../invoices/invoices.service'
import { ResourceType } from './../invoices/enums/invoices.enum'
import { RpcCustomException } from '../common/exceptions/rpc-custom-exception.filter'
import { RpcException } from '@nestjs/microservices'

@Injectable()
export class TripsService {
	constructor(
		@InjectModel(Trip.name)
		private tripModel: Model<TripDocument>,
		private readonly driversService: DriversService,
		private readonly passengersService: PassengersService,
		private readonly invoicesService: InvoicesService
	) {}

	async getAllWithPagination(
		query: TripsQueryDto
	): Promise<Paginated<TripDocument>> {
		try {
			const { page, limit, ...restFilters } = query
			const queryFilter: TripsFilterDto = { ...restFilters }

			return await pagination(this.tripModel, {
				page,
				limit,
				filter: queryFilter,
				populate: ['driver', 'passenger', 'invoice']
			})
		} catch (error) {
			RpcCustomException({
				statusCode: HttpStatus.BAD_REQUEST,
				message: error.message
			})
		}
	}

	async create(createTripDto: CreateTripDto): Promise<TripDocument> {
		const session = await this.tripModel.db.startSession()
		session.startTransaction()
		try {
			const driver = await this.driversService.findOne(createTripDto.driverId)
			const passenger = await this.passengersService.findOne(
				createTripDto.passengerId
			)

			if (driver?.status !== DriverStatus.AVAILABLE) {
				RpcCustomException({
					statusCode: HttpStatus.BAD_REQUEST,
					message: 'Driver is not available'
				})
			}

			if (passenger?.status !== PassengerStatus.AVAILABLE) {
				RpcCustomException({
					statusCode: HttpStatus.BAD_REQUEST,
					message: 'Passenger is not available'
				})
			}

			const distance = this.calculateDistanceKm(
				createTripDto.startCoordinates,
				createTripDto.destinationCoordinates
			)
			const price = this.calculatePrice(distance)

			const trip = new this.tripModel({
				driver: createTripDto.driverId,
				passenger: createTripDto.passengerId,
				status: TripStatus.ACTIVE,
				startCoordinates: {
					type: 'Point',
					coordinates: createTripDto.startCoordinates
				},
				destinationCoordinates: {
					type: 'Point',
					coordinates: createTripDto.destinationCoordinates
				},
				distance,
				startAt: new Date(),
				tip: createTripDto.tip || 0.0,
				price
			})

			driver.status = DriverStatus.TRIP_IN_PROGRESS
			await driver.save({ session })

			passenger.status = PassengerStatus.TRIP_IN_PROGRESS
			await passenger.save({ session })

			const tripCreated = await trip.save({ session })
			await session.commitTransaction()
			await session.endSession()
			return tripCreated.populate(['driver', 'passenger'])
		} catch (error) {
			await session.abortTransaction()
			await session.endSession()
			if (error instanceof RpcException) {
				throw error
			}
			RpcCustomException({
				statusCode: HttpStatus.BAD_REQUEST,
				message: error.message
			})
		}
	}

	private calculateDistanceKm(
		startCoordinates: [number, number],
		destinationCoordinates: [number, number]
	): number {
		return (
			getDistance(
				{ longitude: startCoordinates[0], latitude: startCoordinates[1] },
				{
					longitude: destinationCoordinates[0],
					latitude: destinationCoordinates[1]
				}
			) / 1000
		)
	}
	private calculatePrice(distance: number): number {
		// Fake para calcular tarifa base + precio por km, usarlo en invoice
		const basePrice = 5.0
		const perKm = 1.5
		return basePrice + distance * perKm
	}

	async completeTrip(id: string): Promise<TripDocument> {
		const session = await this.tripModel.db.startSession()
		session.startTransaction()
		try {
			const trip = await this.tripModel.findById(id)

			if (!trip) {
				RpcCustomException({
					statusCode: HttpStatus.NOT_FOUND,
					error: 'not found',
					message: 'Trip not found'
				})
			}

			if (trip.status !== TripStatus.ACTIVE) {
				RpcCustomException({
					statusCode: HttpStatus.BAD_REQUEST,
					message: 'Trip is not active'
				})
			}

			trip.status = TripStatus.COMPLETED
			trip.completedAt = new Date()

			const driver = await this.driversService.findOne(
				(trip.driver as Types.ObjectId).toString()
			)
			driver.status = DriverStatus.AVAILABLE
			await driver.save({ session })

			const passenger = await this.passengersService.findOne(
				(trip.passenger as Types.ObjectId).toString()
			)
			passenger.status = PassengerStatus.AVAILABLE
			await passenger.save({ session })

			if (!trip.invoice) {
				const invoice = await this.invoicesService.create(
					{
						resourceId: trip.id,
						resourceType: ResourceType.TRIP,
						to: {
							name: passenger.name,
							lastName: passenger.lastName
						},
						items: [
							{
								description: `${driver.name} ${driver.lastName} - Servicio de transporte`,
								quantity: 1,
								unitPrice: trip.price
							}
						],
						tip: trip.tip
					},
					session
				)
				trip.invoice = invoice.id
			}

			const tripUpdated = await trip.save({ session })
			await session.commitTransaction()
			await session.endSession()
			return tripUpdated.populate(['driver', 'passenger', 'invoice'])
		} catch (error) {
			await session.abortTransaction()
			await session.endSession()
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

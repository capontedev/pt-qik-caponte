import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateTripDto } from './dto/create-trip.dto'
import { Trip, TripDocument } from './entities/trip.entity'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { DriversService } from './../drivers/drivers.service'
import { PassengersService } from './../passengers/passengers.service'
import { DriverStatus } from './../drivers/enums/driver.enum'
import { TripStatus } from './enums/trip.enum'
import { PassengerStatus } from './../passengers/enums/passenger.enum'
import { getDistance } from 'geolib'
import { TripsFilterDto, TripsQueryDto } from './dto/trip.dto'
import { Paginated } from './../common/pagination/interfaces/pagination.interface'
import { pagination } from './../common/pagination/pagination'
import { InvoicesService } from './../invoices/invoices.service'
import { ResourceType } from './../invoices/enums/invoices.enum'

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
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}

	async create(createTripDto: CreateTripDto): Promise<TripDocument> {
		try {
			const driver = await this.driversService.findOne(createTripDto.driverId)
			const passenger = await this.passengersService.findOne(
				createTripDto.passengerId
			)

			if (driver?.status !== DriverStatus.AVAILABLE) {
				throw new HttpException(
					'Driver is not available',
					HttpStatus.BAD_REQUEST
				)
			}

			if (passenger?.status !== PassengerStatus.AVAILABLE) {
				throw new HttpException(
					'Passenger is not available',
					HttpStatus.BAD_REQUEST
				)
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
			await driver.save()

			passenger.status = PassengerStatus.TRIP_IN_PROGRESS
			await passenger.save()

			const tripCreated = await trip.save()
			return tripCreated.populate(['driver', 'passenger'])
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}

			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
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
		try {
			const trip = await this.tripModel.findById(id)

			if (!trip) {
				throw new HttpException('Trip not found', HttpStatus.NOT_FOUND)
			}

			if (trip.status !== TripStatus.ACTIVE) {
				throw new HttpException('Trip is not active', HttpStatus.BAD_REQUEST)
			}

			trip.status = TripStatus.COMPLETED
			trip.completedAt = new Date()

			const driver = await this.driversService.findOne(
				(trip.driver as Types.ObjectId).toString()
			)
			driver.status = DriverStatus.AVAILABLE
			await driver.save()

			const passenger = await this.passengersService.findOne(
				(trip.passenger as Types.ObjectId).toString()
			)
			passenger.status = PassengerStatus.AVAILABLE
			await passenger.save()

			if (!trip.invoice) {
				const invoice = await this.invoicesService.create({
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
				})

				trip.invoice = invoice.id
			}

			const tripUpdated = await trip.save()
			return tripUpdated.populate(['driver', 'passenger', 'invoice'])
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}
}

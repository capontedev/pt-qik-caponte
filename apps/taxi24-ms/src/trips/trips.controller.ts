import { Controller } from '@nestjs/common'
import { TripsService } from './trips.service'
import { CreateTripDto } from '@app/libs/trips/dto/create-trip.dto'
import { TripIdDto, TripsQueryDto } from '@app/libs/trips/dto/trip.dto'
import { MessagePattern, Payload } from '@nestjs/microservices'
import {
	complete_trip,
	create_trip,
	get_trips
} from '@app/libs/trips/trips.patterns'

@Controller('trips')
export class TripsController {
	constructor(private readonly tripsService: TripsService) {}

	@MessagePattern(get_trips)
	async getAllWithPagination(@Payload() query: TripsQueryDto) {
		return this.tripsService.getAllWithPagination(query)
	}

	@MessagePattern(create_trip)
	create(@Payload() createTripDto: CreateTripDto) {
		return this.tripsService.create(createTripDto)
	}

	@MessagePattern(complete_trip)
	completeTrip(@Payload() params: TripIdDto) {
		return this.tripsService.completeTrip(params.id)
	}
}

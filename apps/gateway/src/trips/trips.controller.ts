import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Query
} from '@nestjs/common'
import { CreateTripDto } from '@app/libs/trips/dto/create-trip.dto'
import { TripIdDto, TripsQueryDto } from '@app/libs/trips/dto/trip.dto'
import { Taxi24MsService } from '../client-taxy24/client-taxy24.services'
import {
	complete_trip,
	create_trip,
	get_trips
} from '@app/libs/trips/trips.patterns'

@Controller('trips')
export class TripsController {
	constructor(private readonly taxi24MsService: Taxi24MsService) {}

	@Get()
	async getAllWithPagination(@Query() query: TripsQueryDto) {
		return this.taxi24MsService.send(get_trips, query)
	}

	@Post()
	create(@Body() createTripDto: CreateTripDto) {
		return this.taxi24MsService.send(create_trip, createTripDto)
	}

	@Patch(':id/complete')
	completeTrip(@Param() params: TripIdDto) {
		return this.taxi24MsService.send(complete_trip, params)
	}
}

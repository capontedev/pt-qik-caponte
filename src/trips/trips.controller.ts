import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Query
} from '@nestjs/common'
import { TripsService } from './trips.service'
import { CreateTripDto } from './dto/create-trip.dto'
import { TripIdDto, TripsQueryDto } from './dto/trip.dto'

@Controller('trips')
export class TripsController {
	constructor(private readonly tripsService: TripsService) {}

	@Get()
	async getAllWithPagination(@Query() query: TripsQueryDto) {
		return this.tripsService.getAllWithPagination(query)
	}

	@Post()
	create(@Body() createTripDto: CreateTripDto) {
		return this.tripsService.create(createTripDto)
	}

	@Patch(':id/complete')
	completeTrip(@Param() params: TripIdDto) {
		return this.tripsService.completeTrip(params.id)
	}
}

import { Controller, Get, Param, Query } from '@nestjs/common'
import {
	PassengersQueryDto,
	PassengerIdDto
} from '@app/libs/passengers/dto/passenger.dto'
import { Taxi24MsService } from './../client-taxy24/client-taxy24.services'
import {
	get_passengers,
	get_passengers_by_id
} from '@app/libs/passengers/passeger.patterns'

@Controller('passengers')
export class PassengersController {
	constructor(private readonly taxi24MsService: Taxi24MsService) {}

	@Get()
	async getAllWithPagination(@Query() query: PassengersQueryDto) {
		return this.taxi24MsService.send(get_passengers, query)
	}

	@Get(':id')
	async findOne(@Param() params: PassengerIdDto) {
		return this.taxi24MsService.send(get_passengers_by_id, params)
	}
}

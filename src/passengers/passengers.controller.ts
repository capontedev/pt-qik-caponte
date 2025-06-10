import { Controller, Get, Param, Query } from '@nestjs/common'
import { PassengersService } from './passengers.service'
import { PassengerIdDto, PassengersQueryDto } from './dto/passenger.dto'

@Controller('passengers')
export class PassengersController {
	constructor(private readonly passengersService: PassengersService) {}

	@Get()
	async getAllWithPagination(@Query() query: PassengersQueryDto) {
		return this.passengersService.getAllWithPagination(query)
	}

	@Get(':id')
	async findOne(@Param() params: PassengerIdDto) {
		return this.passengersService.findOne(params.id)
	}
}

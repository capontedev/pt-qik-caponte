import { Controller } from '@nestjs/common'
import { PassengersService } from './passengers.service'
import {
	PassengerIdDto,
	PassengersQueryDto
} from '@app/libs/passengers/dto/passenger.dto'
import {
	get_passengers,
	get_passengers_by_id
} from '@app/libs/passengers/passeger.patterns'
import { MessagePattern, Payload } from '@nestjs/microservices'

@Controller('passengers')
export class PassengersController {
	constructor(private readonly passengersService: PassengersService) {}

	@MessagePattern(get_passengers)
	async getAllWithPagination(@Payload() query: PassengersQueryDto) {
		return this.passengersService.getAllWithPagination(query)
	}

	@MessagePattern(get_passengers_by_id)
	async findOne(@Payload() params: PassengerIdDto) {
		return this.passengersService.findOne(params.id)
	}
}

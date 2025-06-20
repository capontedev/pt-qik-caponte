import { Controller } from '@nestjs/common'
import { DriversService } from './drivers.service'
import { DriverIdDto, DrivesQueryDto } from '@app/libs/drivers/dto/drivers.dto'
import { MessagePattern, Payload } from '@nestjs/microservices'
import {
	get_drivers,
	get_drivers_by_id,
	get_drivers_nearby
} from '@app/libs/drivers/driver.patterns'

@Controller('drivers')
export class DriversController {
	constructor(private readonly driversService: DriversService) {}

	@MessagePattern(get_drivers)
	async getAllWithPagination(@Payload() query: DrivesQueryDto) {
		return this.driversService.getAllWithPagination(query)
	}

	@MessagePattern(get_drivers_nearby)
	async getNearbyWithPagination(@Payload() query: DrivesQueryDto) {
		return this.driversService.getNearbyWithPagination(query)
	}

	@MessagePattern(get_drivers_by_id)
	async findOne(@Payload() params: DriverIdDto) {
		return this.driversService.findOne(params.id)
	}
}

import { Controller, Get, Param, Query } from '@nestjs/common'
import { DriverIdDto, DrivesQueryDto } from '@app/libs/drivers/dto/drivers.dto'
import { Taxi24MsService } from '../client-taxy24/client-taxy24.services'
import {
	get_drivers,
	get_drivers_by_id,
	get_drivers_nearby
} from '@app/libs/drivers/driver.patterns'

@Controller('drivers')
export class DriversController {
	constructor(private readonly taxi24MsService: Taxi24MsService) {}

	@Get()
	async getAllWithPagination(@Query() query: DrivesQueryDto) {
		return this.taxi24MsService.send(get_drivers, query)
	}

	@Get('nearby')
	async getNearbyWithPagination(@Query() query: DrivesQueryDto) {
		return this.taxi24MsService.send(get_drivers_nearby, query)
	}

	@Get(':id')
	async findOne(@Param() params: DriverIdDto) {
		return this.taxi24MsService.send(get_drivers_by_id, params)
	}
}

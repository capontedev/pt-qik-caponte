import { Controller, Get, Param, Query } from '@nestjs/common'
import { DriversService } from './drivers.service'
import { DriverIdDto, DrivesQueryDto } from './dto/drivers.dto'

@Controller('drivers')
export class DriversController {
	constructor(private readonly driversService: DriversService) {}

	@Get()
	async getAllWithPagination(@Query() query: DrivesQueryDto) {
		return this.driversService.getAllWithPagination(query)
	}

	@Get('nearby')
	async getNearbyWithPagination(@Query() query: DrivesQueryDto) {
		return this.driversService.getNearbyWithPagination(query)
	}

	@Get(':id')
	async findOne(@Param() params: DriverIdDto) {
		return this.driversService.findOne(params.id)
	}
}

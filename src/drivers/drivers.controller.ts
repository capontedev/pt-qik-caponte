import {
	Controller,
	Get,
	Param,
	Query,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { DriversService } from './drivers.service'
import { DriverIdDto, DrivesQueryDto } from './dto/drivers.dto'

@Controller('drivers')
export class DriversController {
	constructor(private readonly driversService: DriversService) {}

	@Get()
	@UsePipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			transformOptions: {
				enableImplicitConversion: true
			}
		})
	)
	async getAllWithPagination(@Query() query: DrivesQueryDto) {
		return this.driversService.getAllWithPagination(query)
	}

	@Get(':id')
	@UsePipes(new ValidationPipe({ transform: true }))
	async findOne(@Param() params: DriverIdDto) {
		return this.driversService.findOne(params.id)
	}
}

import { Module } from '@nestjs/common'
import { DriversService } from './drivers.service'
import { DriversController } from './drivers.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Driver, DriverSchema } from './entities/driver.entity'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Driver.name, schema: DriverSchema }])
	],
	controllers: [DriversController],
	providers: [DriversService],
	exports: [DriversService]
})
export class DriversModule {}

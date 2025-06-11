import { Module } from '@nestjs/common'
import { PassengersService } from './passengers.service'
import { PassengersController } from './passengers.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Passenger, PassengerSchema } from './entities/passenger.entity'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Passenger.name, schema: PassengerSchema }
		])
	],
	controllers: [PassengersController],
	providers: [PassengersService],
	exports: [PassengersService]
})
export class PassengersModule {}

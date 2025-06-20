import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DriversModule } from './drivers/drivers.module'
import { PassengersModule } from './passengers/passengers.module'
import { TripsModule } from './trips/trips.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			cache: true
		}),
		DriversModule,
		PassengersModule,
		TripsModule
	],
	controllers: []
})
export class GatewayModule {}

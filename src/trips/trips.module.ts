import { Module } from '@nestjs/common'
import { TripsService } from './trips.service'
import { TripsController } from './trips.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Trip, TripSchema } from './entities/trip.entity'
import { DriversModule } from 'src/drivers/drivers.module'
import { PassengersModule } from 'src/passengers/passengers.module'
import { InvoicesModule } from 'src/invoices/invoices.module'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
		DriversModule,
		PassengersModule,
		InvoicesModule
	],
	controllers: [TripsController],
	providers: [TripsService],
	exports: [TripsService]
})
export class TripsModule {}

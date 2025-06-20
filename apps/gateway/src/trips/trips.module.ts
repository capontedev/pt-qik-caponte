import { Module } from '@nestjs/common'
import { TripsController } from './trips.controller'
import { ClientTaxy24Module } from '../client-taxy24/client-taxy24.module'

@Module({
	imports: [ClientTaxy24Module],
	controllers: [TripsController]
})
export class TripsModule {}

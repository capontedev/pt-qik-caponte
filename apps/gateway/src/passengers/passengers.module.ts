import { Module } from '@nestjs/common'
import { PassengersController } from './passengers.controller'
import { ClientTaxy24Module } from '../client-taxy24/client-taxy24.module'

@Module({
	imports: [ClientTaxy24Module],
	controllers: [PassengersController]
})
export class PassengersModule {}

import { Module } from '@nestjs/common'
import { DriversController } from './drivers.controller'
import { ClientTaxy24Module } from '../client-taxy24/client-taxy24.module'

@Module({
	imports: [ClientTaxy24Module],
	controllers: [DriversController]
})
export class DriversModule {}

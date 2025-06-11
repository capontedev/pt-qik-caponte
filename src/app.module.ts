import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { DriversModule } from './drivers/drivers.module'
import { MongooseModule } from '@nestjs/mongoose'
import { PassengersModule } from './passengers/passengers.module'
import { TripsModule } from './trips/trips.module'
import { SettingsModule } from './settings/settings.module'
import { InvoicesModule } from './invoices/invoices.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			cache: true
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				uri: configService.get<string>('MONGO_URI')
			})
		}),
		DriversModule,
		PassengersModule,
		TripsModule,
		SettingsModule,
		InvoicesModule
	]
})
export class AppModule {}

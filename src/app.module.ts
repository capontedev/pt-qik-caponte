import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { DriversModule } from './drivers/drivers.module'
import { MongooseModule } from '@nestjs/mongoose'
import { PassengersModule } from './passengers/passengers.module'

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
		PassengersModule
	]
})
export class AppModule {}

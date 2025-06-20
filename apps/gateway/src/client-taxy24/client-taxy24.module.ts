import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { TAXI24_SERVICE, Taxi24MsService } from './client-taxy24.services'

@Module({
	imports: [
		ClientsModule.registerAsync([
			{
				imports: [ConfigModule],
				name: TAXI24_SERVICE,
				useFactory: async (configService: ConfigService) => ({
					transport: Transport.TCP,
					options: {
						url: configService.get<string>('URL_TAXI24'),
						port: configService.get<number>('PORT_TAXI24')
					}
				}),
				inject: [ConfigService]
			}
		])
	],
	providers: [Taxi24MsService],
	exports: [ClientsModule, Taxi24MsService]
})
export class ClientTaxy24Module {}

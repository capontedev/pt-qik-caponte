import { NestFactory } from '@nestjs/core'
import { Taxi24MsModule } from './taxi24-ms.module'
import { ConfigService } from '@nestjs/config'
import { Logger, ValidationPipe } from '@nestjs/common'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

async function bootstrap() {
	const logger = new Logger('Taxi24')

	const appContext = await NestFactory.create(Taxi24MsModule)
	const configService = appContext.get(ConfigService)
	const port = configService.get<number>('PORT_TAXI24') ?? 3001
	await appContext.close()

	const app = await NestFactory.createMicroservice<MicroserviceOptions>(
		Taxi24MsModule,
		{
			transport: Transport.TCP,
			options: { port }
		}
	)

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true
		})
	)

	await app.listen()
	logger.verbose(`Application is running on port ${port}`)
}
bootstrap()

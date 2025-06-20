import { NestFactory } from '@nestjs/core'
import { GatewayModule } from './gateway.module'
import { ConfigService } from '@nestjs/config'
import { Logger, ValidationPipe } from '@nestjs/common'
import { RpcCustomExceptionFilter } from './common/exceptions/rpc-custom-exception.filter'

async function bootstrap() {
	const logger = new Logger('Gateway')
	const app = await NestFactory.create(GatewayModule)

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true
		})
	)

	app.useGlobalFilters(new RpcCustomExceptionFilter())

	const configService = app.get(ConfigService)
	const port = configService.get<number>('PORT_GATEWAY') ?? 3000
	await app.listen(port, () => {
		logger.verbose(`Application is running on: http://localhost:${port}`)
	})
}
bootstrap()

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { Logger, ValidationPipe } from '@nestjs/common'

async function bootstrap() {
	const logger = new Logger('Main Service')
	const app = await NestFactory.create(AppModule)
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true
		})
	)
	const configService = app.get(ConfigService)
	const port = configService.get<number>('PORT') ?? 3000
	await app.listen(port, () => {
		logger.verbose(`Application is running on: http://localhost:${port}`)
	})
}
bootstrap()

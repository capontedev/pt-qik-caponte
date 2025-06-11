import { Module } from '@nestjs/common'
import { SettingsService } from './settings.service'
import { MongooseModule } from '@nestjs/mongoose'
import { Setting, SettingSchema } from './entities/setting.entity'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }])
	],
	providers: [SettingsService],
	exports: [SettingsService]
})
export class SettingsModule {}

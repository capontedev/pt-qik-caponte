import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Setting, SettingDocument } from './entities/setting.entity'

@Injectable()
export class SettingsService {
	constructor(
		@InjectModel(Setting.name)
		private settingModel: Model<SettingDocument>
	) {}

	async getValueByKey(key: string): Promise<SettingDocument> {
		try {
			const setting = await this.settingModel.findOne({ key })

			if (!setting) {
				throw new HttpException('Setting not found', HttpStatus.NOT_FOUND)
			}

			return setting
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}

			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}

	async update(id: string, value: string): Promise<SettingDocument> {
		try {
			const setting = await this.settingModel.findByIdAndUpdate(id, { value })

			if (!setting) {
				throw new HttpException('Setting not found', HttpStatus.NOT_FOUND)
			}

			return setting
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}

			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}
}

import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Setting, SettingDocument } from './entities/setting.entity'
import { RpcCustomException } from '../common/exceptions/rpc-custom-exception.filter'
import { RpcException } from '@nestjs/microservices'

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
				RpcCustomException({
					statusCode: HttpStatus.NOT_FOUND,
					error: 'not found',
					message: 'Setting not found'
				})
			}

			return setting
		} catch (error) {
			if (error instanceof RpcException) {
				throw error
			}

			RpcCustomException({
				statusCode: HttpStatus.BAD_REQUEST,
				message: error.message
			})
		}
	}

	async update(id: string, value: string): Promise<SettingDocument> {
		try {
			const setting = await this.settingModel.findByIdAndUpdate(id, { value })

			if (!setting) {
				RpcCustomException({
					statusCode: HttpStatus.NOT_FOUND,
					error: 'not found',
					message: 'Setting not found'
				})
			}

			return setting
		} catch (error) {
			if (error instanceof RpcException) {
				throw error
			}

			RpcCustomException({
				statusCode: HttpStatus.BAD_REQUEST,
				message: error.message
			})
		}
	}
}

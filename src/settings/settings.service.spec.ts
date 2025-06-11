import { Test, TestingModule } from '@nestjs/testing'
import { SettingsService } from './settings.service'
import { getModelToken } from '@nestjs/mongoose'
import { Setting } from './entities/setting.entity'
import { HttpException, HttpStatus } from '@nestjs/common'

describe('SettingsService', () => {
	let service: SettingsService

	const mockSettingModel = {
		findOne: jest.fn()
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SettingsService,
				{
					provide: getModelToken(Setting.name),
					useValue: mockSettingModel
				}
			]
		}).compile()

		service = module.get<SettingsService>(SettingsService)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	describe('getValueByKey', () => {
		it('should return a passenger when valid id is provided', async () => {
			const mockSetting = { key: 'test', value: '123' }
			mockSettingModel.findOne.mockResolvedValue(mockSetting)
			const result = await service.getValueByKey('test')
			expect(result).toBe(mockSetting)
			expect(mockSettingModel.findOne).toHaveBeenCalledWith({ key: 'test' })
		})

		it('should throw HttpException when passenger not found', async () => {
			mockSettingModel.findOne.mockResolvedValue(null)

			await expect(service.getValueByKey('1')).rejects.toThrow(
				new HttpException('Setting not found', HttpStatus.NOT_FOUND)
			)
		})

		it('should throw HttpException on bad request', async () => {
			mockSettingModel.findOne.mockRejectedValue(new Error('Bad request'))

			await expect(service.getValueByKey('1')).rejects.toThrow(
				new HttpException('Bad request', HttpStatus.BAD_REQUEST)
			)
		})

		it('should throw BadRequestException for invalid id format', async () => {
			mockSettingModel.findOne.mockRejectedValue(
				new Error('Cast to ObjectId failed')
			)

			await expect(service.getValueByKey('invalid-id')).rejects.toThrow(
				new HttpException('Cast to ObjectId failed', HttpStatus.BAD_REQUEST)
			)
		})
	})
})

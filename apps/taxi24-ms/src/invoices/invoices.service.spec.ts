import { Test, TestingModule } from '@nestjs/testing'
import { InvoicesService } from './invoices.service'
import { getModelToken } from '@nestjs/mongoose'
import { Invoice, InvoiceDocument } from './entities/invoice.entity'
import { SettingsService } from './../settings/settings.service'
import { Model } from 'mongoose'
import { HttpStatus } from '@nestjs/common'
import { ResourceType } from './enums/invoices.enum'
import { InvoiceData } from './interfaces/invoices.interfaces'
import { RpcException } from '@nestjs/microservices'

describe('InvoiceService', () => {
	let service: InvoicesService
	let model: jest.Mocked<Model<InvoiceDocument>>
	let settingsService: SettingsService

	const mockInvoice = {
		_id: 'invoice123',
		resourceId: '507f1f77bcf86cd799439013',
		resourceType: 'Trip',
		invoiceNumber: 1,
		to: {
			name: 'Juan',
			lastName: 'Pérez'
		},
		items: [
			{
				description: 'Trip',
				quantity: 1,
				unitPrice: 100,
				total: 100
			}
		],
		totals: {
			subtotal: 100,
			taxPercentage: 0,
			tax: 0,
			tip: 0,
			total: 100
		},
		createdAt: new Date('2025-01-01'),
		updatedAt: new Date('2025-01-01'),
		save: jest.fn()
	} as any

	const mockInvoiceModel = Object.assign(
		jest.fn().mockImplementation(() => mockInvoice),
		{
			findById: jest.fn()
		}
	)

	const mockInvoiceData: InvoiceData = {
		resourceId: '507f1f77bcf86cd799439013',
		resourceType: ResourceType.TRIP,
		to: { name: 'Juan', lastName: 'Pérez' },
		items: [{ description: 'Trip', quantity: 1, unitPrice: 100 }],
		tip: 0
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				InvoicesService,
				{
					provide: getModelToken(Invoice.name),
					useValue: mockInvoiceModel
				},
				{
					provide: SettingsService,
					useValue: {
						getValueByKey: jest.fn(),
						update: jest.fn()
					}
				}
			]
		}).compile()

		service = module.get<InvoicesService>(InvoicesService)
		model = module.get<jest.Mocked<Model<InvoiceDocument>>>(
			getModelToken(Invoice.name)
		)
		settingsService = module.get<SettingsService>(SettingsService)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	describe('findOne', () => {
		it('should return a invoice', async () => {
			mockInvoiceModel.findById.mockResolvedValue(mockInvoice)

			const result = await service.findOne('1')

			expect(result).toEqual(mockInvoice)
			expect(model.findById).toHaveBeenCalledWith('1')
		})

		it('should throw RpcException when invoice not found', async () => {
			mockInvoiceModel.findById.mockResolvedValue(null)

			await expect(service.findOne('1')).rejects.toThrow(
				new RpcException({
					statusCode: HttpStatus.NOT_FOUND,
					error: 'not found',
					message: 'Invoice not found'
				})
			)
		})

		it('should throw RpcException on bad request', async () => {
			mockInvoiceModel.findById.mockRejectedValue(new Error('Bad request'))

			await expect(service.findOne('1')).rejects.toThrow(
				new RpcException({
					statusCode: HttpStatus.BAD_REQUEST,
					error: 'bad request',
					message: 'Bad request'
				})
			)
		})

		it('should throw BadRequestException for invalid id format', async () => {
			mockInvoiceModel.findById.mockRejectedValue(
				new Error('Cast to ObjectId failed')
			)

			await expect(service.findOne('invalid-id')).rejects.toThrow(
				new RpcException({
					statusCode: HttpStatus.BAD_REQUEST,
					error: 'bad request',
					message: 'Cast to ObjectId failed'
				})
			)
		})
	})

	describe('create', () => {
		it('should create an invoice and return it', async () => {
			const mockSettingInvoiceNumber = { value: 1, id: 'setting1' }
			const mockSettingTaxPercentaje = { value: 10 }

			jest
				.spyOn(settingsService, 'getValueByKey')
				.mockResolvedValueOnce(mockSettingInvoiceNumber as any)
				.mockResolvedValueOnce(mockSettingTaxPercentaje as any)
			jest.spyOn(settingsService, 'update').mockResolvedValue({} as any)
			mockInvoice.save.mockResolvedValue(mockInvoice)

			const result = await service.create(mockInvoiceData)

			expect(result).toEqual(mockInvoice)
			expect(settingsService.getValueByKey).toHaveBeenCalledWith(
				'InvoiceNumber'
			)
			expect(settingsService.getValueByKey).toHaveBeenCalledWith(
				'TaxPercentaje'
			)
			expect(settingsService.update).toHaveBeenCalledWith('setting1', '2')
			expect(mockInvoice.save).toHaveBeenCalled()
		})

		it('should throw RpcException on error', async () => {
			jest
				.spyOn(settingsService, 'getValueByKey')
				.mockRejectedValue(new Error('fail'))

			await expect(service.create(mockInvoiceData)).rejects.toThrow(
				new RpcException({
					statusCode: HttpStatus.BAD_REQUEST,
					error: 'bad request',
					message: 'fail'
				})
			)
		})
	})
})

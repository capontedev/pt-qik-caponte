import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Invoice, InvoiceDocument } from './entities/invoice.entity'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { InvoiceData } from './interfaces/invoices.interfaces'
import { roundToTwo } from '../common/utils/utils.number'
import { SettingsService } from '../settings/settings.service'

@Injectable()
export class InvoicesService {
	constructor(
		@InjectModel(Invoice.name)
		private invoiceModel: Model<InvoiceDocument>,
		private readonly settingsService: SettingsService
	) {}

	async findOne(id: string) {
		try {
			const invoice = await this.invoiceModel.findById(id)

			if (!invoice) {
				throw new HttpException('Invoice not found', HttpStatus.NOT_FOUND)
			}

			return invoice
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}

			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}

	async create(data: InvoiceData): Promise<InvoiceDocument> {
		try {
			const [settingInvoiceNumber, settingTaxPercentaje] = await Promise.all([
				this.settingsService.getValueByKey('InvoiceNumber'),
				this.settingsService.getValueByKey('TaxPercentaje')
			])

			let subtotal = 0
			const items = data.items.map(item => {
				const total = item.quantity * item.unitPrice
				subtotal += total

				return {
					...item,
					total
				}
			})

			subtotal = roundToTwo(subtotal)
			const taxPercentage = Number(settingTaxPercentaje.value)
			const tax = roundToTwo(subtotal * (taxPercentage / 100))
			const tip = roundToTwo(data.tip || 0)
			const total = roundToTwo(subtotal + tax + tip)

			const invoiceNumber = Number(settingInvoiceNumber.value) + 1

			await this.settingsService.update(
				settingInvoiceNumber.id,
				String(invoiceNumber)
			)

			const invoice = new this.invoiceModel({
				resourceId: data.resourceId,
				resourceType: data.resourceType,
				invoiceNumber,
				to: {
					name: data.to.name,
					lastName: data.to.lastName
				},
				items,
				totals: {
					subtotal,
					taxPercentage,
					tax,
					tip,
					total
				}
			})

			return await invoice.save()
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}

			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}
}

import { ResourceType } from '../enums/invoices.enum'

export interface InvoiceData {
	resourceId: string
	resourceType: ResourceType
	to: {
		name: string
		lastName?: string
	}
	items: {
		description: string
		quantity: number
		unitPrice: number
	}[]
	tip: number
}

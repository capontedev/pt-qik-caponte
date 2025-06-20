import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema, Types } from 'mongoose'
import { ResourceType } from '../enums/invoices.enum'
import { transformSchemaJson } from '@app/libs/common/utils/utils.mongo'

const InvoiceItemSchema = new MongooseSchema(
	{
		description: { type: String, required: true },
		quantity: { type: Number, required: true },
		unitPrice: { type: Number, required: true },
		total: { type: Number, required: true }
	},
	{ _id: false }
)

@Schema({
	timestamps: true,
	toJSON: {
		transform: transformSchemaJson
	},
	toObject: { virtuals: true }
})
export class Invoice {
	id: string

	@Prop({
		type: MongooseSchema.Types.ObjectId,
		required: true,
		refPath: 'resourceType'
	})
	resourceId: Types.ObjectId

	@Prop({
		type: String,
		required: true,
		enum: ResourceType
	})
	resourceType: ResourceType

	@Prop({
		type: Number,
		required: true
	})
	invoiceNumber: number

	@Prop({
		type: {
			name: { type: String },
			lastName: { type: String }
		},
		required: true,
		_id: false
	})
	to: {
		name: string
		lastName: string
	}

	@Prop({ type: [InvoiceItemSchema], required: true })
	items: {
		description: string
		quantity: number
		unitPrice: number
		total: number
	}[]

	@Prop({
		type: {
			subtotal: { type: Number, default: 0 },
			taxPercentage: { type: Number, default: 0 },
			tax: { type: Number, default: 0 },
			tip: { type: Number, default: 0 },
			total: { type: Number, default: 0 }
		},
		required: true,
		_id: false
	})
	totals: {
		subtotal: number
		taxPercentage: number
		tax: number
		tip: number
		total: number
	}
}

export type InvoiceDocument = Invoice & Document
export const InvoiceSchema = SchemaFactory.createForClass(Invoice)

InvoiceSchema.index({ resourceId: 1 })
InvoiceSchema.index({ resourceId: 1, resourceType: 1 })

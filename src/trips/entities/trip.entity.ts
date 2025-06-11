import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types, Schema as MongooseSchema } from 'mongoose'
import { TripStatus } from '../enums/trip.enum'
import { Driver } from './../../drivers/entities/driver.entity'
import { Passenger } from './../../passengers/entities/passenger.entity'
import { PaymentType } from './../../common/enums/payment-type.enum'

@Schema({
	timestamps: true,
	toJSON: {
		transform: (_, ret) => {
			ret.id = ret._id
			delete ret._id
			delete ret.__v
		}
	},
	toObject: { virtuals: true }
})
export class Trip {
	id: string

	@Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Driver', required: true })
	driver: Driver | Types.ObjectId

	@Prop({
		type: MongooseSchema.Types.ObjectId,
		ref: 'Passenger',
		required: true
	})
	passenger: Passenger | Types.ObjectId

	@Prop({
		required: true,
		type: String,
		enum: TripStatus,
		default: TripStatus.ACTIVE
	})
	status: TripStatus

	@Prop({
		type: { type: String, enum: ['Point'], require: true },
		coordinates: { type: [Number] }
	})
	startCoordinates: { type: string; coordinates: number[] }

	@Prop({
		type: { type: String, enum: ['Point'], require: true },
		coordinates: { type: [Number] }
	})
	destinationCoordinates: { type: string; coordinates: number[] }

	@Prop({
		type: Number,
		default: 0.0
	})
	price: number

	@Prop({
		type: Number,
		default: 0.0
	})
	tip: number

	@Prop({
		required: true,
		type: String,
		enum: PaymentType,
		default: PaymentType.CASH
	})
	paymentType: PaymentType

	@Prop({ type: Number })
	distance?: number

	@Prop({ type: Date })
	startAt: Date

	@Prop({ type: Date })
	completedAt: Date

	@Prop()
	createdAt: Date

	@Prop()
	updatedAt: Date
}

export type TripDocument = Trip & Document
export const TripSchema = SchemaFactory.createForClass(Trip)

TripSchema.index({ status: 1 })

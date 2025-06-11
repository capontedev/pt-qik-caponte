import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { PassengerStatus } from '../enums/passenger.enum'
import { transformSchemaJson } from './../../common/utils/utils.mongo'

@Schema({
	timestamps: true,
	toJSON: {
		transform: transformSchemaJson
	},
	toObject: { virtuals: true }
})
export class Passenger {
	id: string

	@Prop({ required: true, type: String })
	name: string

	@Prop({ required: true, type: String })
	lastName: string

	@Prop({
		required: true,
		type: String,
		enum: PassengerStatus,
		default: PassengerStatus.AVAILABLE
	})
	status: PassengerStatus

	@Prop()
	createdAt: Date

	@Prop()
	updatedAt: Date
}

export type PassengerDocument = Passenger & Document
export const PassengerSchema = SchemaFactory.createForClass(Passenger)

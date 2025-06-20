import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { DriverStatus } from '@app/libs/drivers/enums/driver.enum'
import { transformSchemaJson } from '@app/libs/common/utils/utils.mongo'

@Schema({
	timestamps: true,
	toJSON: {
		transform: transformSchemaJson
	},
	toObject: { virtuals: true }
})
export class Driver {
	id: string

	@Prop({ required: true, type: String })
	name: string

	@Prop({ required: true, type: String })
	lastName: string

	@Prop({
		required: true,
		type: String,
		enum: DriverStatus,
		default: DriverStatus.UNAVAILABLE
	})
	status: DriverStatus

	@Prop({
		type: { type: String, enum: ['Point'] },
		coordinates: { type: [Number] }
	})
	lastCoordinates?: { type: string; coordinates: number[] }

	@Prop()
	createdAt: Date

	@Prop()
	updatedAt: Date
}

export type DriverDocument = Driver & Document
export const DriverSchema = SchemaFactory.createForClass(Driver)

DriverSchema.index({ lastCoordinates: '2dsphere' }, { sparse: true })
DriverSchema.index({ status: 1 })

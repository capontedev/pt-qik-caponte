import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { transformSchemaJson } from '@app/libs/common/utils/utils.mongo'

@Schema({
	timestamps: true,
	toJSON: {
		transform: transformSchemaJson
	},
	toObject: { virtuals: true }
})
export class Setting {
	id: string

	@Prop({ required: true, type: String })
	key: string

	@Prop({ required: true, type: String })
	value: string

	@Prop()
	createdAt: Date

	@Prop()
	updatedAt: Date
}

export type SettingDocument = Setting & Document
export const SettingSchema = SchemaFactory.createForClass(Setting)

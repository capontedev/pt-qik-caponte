import { HydratedDocument } from 'mongoose'

export function transformSchemaJson(
	doc: HydratedDocument<unknown>,
	ret: Record<string, any>
) {
	ret.id = ret._id
	delete ret._id
	delete ret.__v

	return Object.keys(doc.schema.obj).reduce(
		(ordered, key) => {
			if (ret[key] !== undefined) ordered[key] = ret[key]
			return ordered
		},
		{ id: ret.id }
	)
}

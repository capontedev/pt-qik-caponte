import { Model, PopulateOptions, SortOrder } from 'mongoose'
import {
	type Paginated,
	type Limit,
	type Page
} from './interfaces/pagination.interface'

export interface PaginateOptions<F = Record<string, unknown>> {
	page?: Page
	limit?: Limit
	id?: string
	filter?: F
	sort?:
		| string
		| { [key: string]: SortOrder | { $meta: any } }
		| [string, SortOrder][]
		| undefined
		| null
	populate?: PopulateOptions | (PopulateOptions | string)[]
}

export async function pagination<T, F>(
	model: Model<T>,
	options: PaginateOptions<F>
): Promise<Paginated<T>> {
	const { page = 1, limit = 10, sort, filter = {}, populate } = options

	Object.keys(filter).forEach(key => {
		if (filter[key] === undefined) delete filter[key]
	})

	const mongooseQuery = model.find(filter)

	if (sort) {
		mongooseQuery.sort(sort)
	}

	if (populate) {
		mongooseQuery.populate(populate)
	}

	const skip = (page - 1) * limit
	mongooseQuery.limit(limit).skip(skip)

	const dbResults: T[] = await mongooseQuery

	const totalRecords = await model.countDocuments(filter)
	const hasNextPage = dbResults.length === limit && skip + limit < totalRecords
	const totalPages = Math.ceil(totalRecords / limit)

	return {
		items: dbResults,
		totalRecords,
		totalPages,
		hasNextPage
	}
}

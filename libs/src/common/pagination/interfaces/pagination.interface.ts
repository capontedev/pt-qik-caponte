export interface Paginated<T> {
	items: T[]
	totalRecords: number
	totalPages: number
	hasNextPage: boolean
}

export type Page = number
export type Limit = number

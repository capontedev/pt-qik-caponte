import { Type } from 'class-transformer'
import { Transform } from 'class-transformer'
import { IsMongoId, IsEnum, IsInt, IsOptional, IsNumber } from 'class-validator'
import { DriverStatus } from '../enums/driver.enum'
import { OmitType } from '@nestjs/mapped-types'
import { PaginationDto } from './../../common/pagination/dto/pagination.dto'

export class DrivesQueryDto extends PaginationDto {
	@IsOptional()
	@IsEnum(DriverStatus)
	status?: DriverStatus

	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	lat?: number

	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	lon?: number

	@IsOptional()
	@IsInt()
	@Type(() => Number)
	@Transform(({ value, key }) => {
		if (key === 'max-distance') {
			return Number(value)
		}
		return value
	})
	maxDistance?: number
}

export class DrivesFilterDto extends OmitType(DrivesQueryDto, [
	'page',
	'limit'
] as const) {
	lastCoordinates?: any
}

export class DriverIdDto {
	@IsMongoId()
	id: string
}

import { IsMongoId, IsEnum, IsOptional } from 'class-validator'
import { TripStatus } from '../enums/trip.enum'
import { PaginationDto } from '@app/libs/common/pagination/dto/pagination.dto'
import { OmitType } from '@nestjs/mapped-types'

export class TripsQueryDto extends PaginationDto {
	@IsOptional()
	@IsEnum(TripStatus)
	status?: TripStatus
}

export class TripsFilterDto extends OmitType(TripsQueryDto, [
	'page',
	'limit'
] as const) {}

export class TripIdDto {
	@IsMongoId()
	id: string
}

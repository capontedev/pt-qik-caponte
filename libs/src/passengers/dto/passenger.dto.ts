import { IsMongoId, IsEnum, IsOptional } from 'class-validator'
import { PassengerStatus } from '../enums/passenger.enum'
import { OmitType } from '@nestjs/mapped-types'
import { PaginationDto } from '@app/libs/common/pagination/dto/pagination.dto'

export class PassengersQueryDto extends PaginationDto {
	@IsOptional()
	@IsEnum(PassengerStatus)
	status?: PassengerStatus
}

export class PassengersFilterDto extends OmitType(PassengersQueryDto, [
	'page',
	'limit'
] as const) {}

export class PassengerIdDto {
	@IsMongoId()
	id: string
}

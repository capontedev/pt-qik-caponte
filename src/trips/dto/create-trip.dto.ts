import {
	IsMongoId,
	IsArray,
	IsNumber,
	ArrayMinSize,
	ArrayMaxSize,
	IsEnum,
	IsOptional
} from 'class-validator'
import { Type } from 'class-transformer'
import { PaymentType } from './../../common/enums/payment-type.enum'

export class CreateTripDto {
	@IsMongoId()
	driverId: string

	@IsMongoId()
	passengerId: string

	@IsArray()
	@ArrayMinSize(2)
	@ArrayMaxSize(2)
	@IsNumber({}, { each: true })
	@Type(() => Number)
	startCoordinates: [number, number]

	@IsArray()
	@ArrayMinSize(2)
	@ArrayMaxSize(2)
	@IsNumber({}, { each: true })
	@Type(() => Number)
	destinationCoordinates: [number, number]

	@IsEnum(PaymentType)
	paymentType: PaymentType

	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	tip?: number
}

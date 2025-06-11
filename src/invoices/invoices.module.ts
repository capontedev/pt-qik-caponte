import { Module } from '@nestjs/common'
import { InvoicesService } from './invoices.service'
import { MongooseModule } from '@nestjs/mongoose'
import { Invoice, InvoiceSchema } from './entities/invoice.entity'
import { SettingsModule } from '../settings/settings.module'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
		SettingsModule
	],
	providers: [InvoicesService],
	exports: [InvoicesService]
})
export class InvoicesModule {}

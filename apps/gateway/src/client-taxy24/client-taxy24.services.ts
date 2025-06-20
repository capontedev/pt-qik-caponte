import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { catchError, Observable } from 'rxjs'

export const TAXI24_SERVICE = 'TAXI24_SERVICE'

@Injectable()
export class Taxi24MsService<TResult = any, TInput = any> {
	constructor(@Inject(TAXI24_SERVICE) private readonly proxy: ClientProxy) {}

	send(pattern: any, data: TInput): Observable<TResult> {
		return this.proxy.send(pattern, data).pipe(
			catchError(err => {
				throw new RpcException(err)
			})
		)
	}
}

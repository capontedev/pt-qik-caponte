import { RpcException } from '@nestjs/microservices'

export const RpcCustomException = (opt: {
	statusCode: number
	error?: string
	message: string
}) => {
	throw new RpcException({
		statusCode: opt.statusCode,
		error: opt.error || 'bad request',
		message: opt.message
	})
}

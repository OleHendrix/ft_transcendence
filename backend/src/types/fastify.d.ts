import { FastifyInstance } from 'fastify';

export interface JwtPayload
{
	sub: number;
	username: string;
	email: string;
}

declare module 'fastify' {
	interface FastifyInstance
	{
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
	}

	interface FastifyRequest
	{
		account: JwtPayload;
	}
}

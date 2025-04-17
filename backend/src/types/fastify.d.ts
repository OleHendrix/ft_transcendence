import '@fastify/jwt';

declare module 'fastify'
{
	interface FastifyInstance
	{
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
	}

	interface FastifyRequest
	{
		account:
		{
			sub:      number;
			username: string;
			iat:      number;
			exp:      number;
		};
	}
};

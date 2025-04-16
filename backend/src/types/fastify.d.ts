import '@fastify/jwt';

declare module 'fastify'
{
	interface FastifyInstance
	{
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
	}

	interface FastifyRequest
	{
		user:
		{
			sub:      number;
			username: string;
			iat:      number;
			exp:      number;
		};
	}
};

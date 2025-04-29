import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export default async function login(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/refresh-token', async (request, reply) =>
	{
		const userId = request.account.sub;
		const account = await prisma.account.findUnique({ where: { id: userId } });

		if (!account)
			return reply.code(404).send({ error: 'user not found' });

		const newAccessToken = fastify.jwt.sign({
			sub: account.id,
			username: account.username,
			email: account.email,
			twofaRequired: true,
		},
		{ expiresIn: '1h' });

		return reply.send({ newAccessToken });
	});
}
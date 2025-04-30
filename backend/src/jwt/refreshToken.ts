import { PrismaClient } from '.prisma/client';
import { FastifyInstance } from 'fastify';

export default async function refreshToken(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/refresh-token', async (request, reply) =>
	{
		const { refreshToken } = request.body as { refreshToken: string };
		if (!refreshToken)
			return reply.code(401).send({ error: 'no refreshToken provided '});

		let decoded;
		try
		{
			decoded = fastify.jwt.verify<{ sub: number}>(refreshToken);
		}
		catch (error)
		{
			return reply.code(401).send({ error: 'invalid refreshToken' });
		}

		const userId = decoded.sub;

		const account = await prisma.account.findUnique({ where: { id: userId }});

		if (!account)
			return reply.code(404).send({ error: 'account not found' });

		const newAccessToken = fastify.jwt.sign({
			sub: account.id,
			username: account.username,
			email: account.email,
			twofaRequired: true,
		},
		{ expiresIn: '1h' });

		const newRefreshToken = fastify.jwt.sign({
			sub: account.id,
		},
		{ expiresIn: '7d' });

		console.log('Refreshed tokens for', account.username);

		return reply.send({ newAccessToken, newRefreshToken });
	});
}
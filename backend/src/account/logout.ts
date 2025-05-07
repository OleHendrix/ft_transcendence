import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export default async function logout(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/logout',
		{
			preHandler: fastify.authenticate
		},
		async (request, reply) =>
	{
		const userId = request.account.sub;
	
		const user = await prisma.account.update(
			{
				where: { id:     userId },
				data:  { online: false }
			}
		);
		if (!user) 
			return reply.status(404).send({ error: 'User not found' })

		reply.send({ success: true });
	});
}
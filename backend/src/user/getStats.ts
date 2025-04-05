import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';

export default async function getStats(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/get-stats', async (req, reply) =>
	{
		const { userId } = req.body as { userId: number };
		console.log('id:', userId);
		const stats = await prisma.account.findUnique({
				where: { id: userId },
				select: {wins: true, draws: true, losses: true, elo: true}
			});
		if (!stats)
			return reply.status(404).send({ error: 'User not found'});

		return reply.status(200).send({ stats })
	});
}
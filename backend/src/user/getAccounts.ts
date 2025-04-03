import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';

export default async function getAccounts(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/get-accounts', async (request, reply) => 
	{
		const { getStats } = request.body as { getStats: boolean };
		try
		{
			const accounts = await prisma.account.findMany(
				{
					select:
					{
						id: true,
						username: true,
						online: true,
						wins: getStats,
						draws: getStats,
						loses: getStats,
					}
				}
			);
			return reply.send({ success: true, accounts });
		}
		catch (error)
		{
			return reply.status(500).send({ error: 'Error getting accounts from database' });
		}
	});
}
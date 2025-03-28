import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';

export default async function getOnlineAccounts(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.get('/api/get-online-accounts', async (request, reply) =>
	{
		try
		{
			const accounts = await prisma.account.findMany(
				{ where: { online: true }}
			);
			return reply.send({ success: true, accounts });
		}
		catch (error)
		{
			return reply.status(500).send({ error: 'Failed to fetch online players' });
		}
	});
}
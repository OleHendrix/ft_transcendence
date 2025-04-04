import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';

export default async function getAccounts(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.get('/api/get-accounts', async (request, reply) => 
	{
		try
		{
			let accounts = await prisma.account.findMany();
			const accountsWithoutPassword = accounts.map(({ password, ...rest }) => rest);
			return reply.send({ success: true, accounts: accountsWithoutPassword });
		}
		catch (error)
		{
			return reply.status(500).send({ error: 'Error getting accounts from database' });
		}
	});
}
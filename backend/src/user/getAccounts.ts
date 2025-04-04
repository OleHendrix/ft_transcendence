import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';

export default async function getAccounts(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.get('/api/get-accounts', async (request, reply) => 
	{
		try
		{
			let accounts = await prisma.account.findMany({ where: {NOT: { id: 1 } } });
			const accountsWithoutPassword = accounts.map(({ password, totpSecret, ...rest }) => rest);
			// console.log('hallo??', accountsWithoutPassword);
			return reply.send({ accounts: accountsWithoutPassword });
		}
		catch (error)
		{
			return reply.status(500).send({ error: 'Error getting accounts from database' });
		}
	});
}
import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';

export default async function getAccounts(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.get('/api/get-accounts', async (request, reply) => 
	{
		// const hostUrl = `${request.protocol}://${request.hostname}`;
		try
		{
			let accounts = await prisma.account.findMany({ where: { NOT: { id: 1 } }, include: { matches: true }});
			const accountsWithoutPassword = accounts.map(({ password, totpSecret, ...rest }) => rest);
			const accountsWithAvatarPath = accountsWithoutPassword.map((account) =>
			{
  				return 	{
    				...account,
    				avatar: account.avatar ? `${process.env.BACKEND_URL}${account.avatar}` : account.avatar
  						};
			});
			return reply.send({ accounts: accountsWithAvatarPath });
		}
		catch (error)
		{
			console.log(error);
			return reply.status(500).send({ error: 'Error getting accounts from database' });
		}
	});
}
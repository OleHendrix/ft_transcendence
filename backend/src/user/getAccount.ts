import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';

export default async function getAccount(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.get('/api/get-account', async (request, reply) =>
	{
		const { accountId } = request.query as { accountId: string };
		const accountIdNum = Number(accountId);
		const user = await prisma.account.findUnique({ where: { id: accountIdNum }});
		if (user)
		{
			reply.send({ success: true, user});
		}
		else
			reply.status(404).send({ success: false, error: "Error in fetching account"});
	});
}
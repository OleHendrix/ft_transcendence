import { FastifyInstance } from "fastify/fastify";
import { PrismaClient } from "@prisma/client/default";

export default async function getAccountData(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/get-account-data',
		{
			preHandler: fastify.authenticate
		},
		async (request, reply) =>
	{
		const userId = request.account.sub;

		const account = await prisma.account.findUnique({ where: { id: userId } });
		if (!account)
			return reply.code(404).send({ message: 'User not found'});

		const { password, ...safeAccount } = account;
		const jsonData = JSON.stringify(safeAccount, null, 2);

		reply
			.header('Content-Type', 'application/json')
			.header('Content-Disposition', 'attachment; filename="account-data.json"')
			.send(jsonData);
	});
}
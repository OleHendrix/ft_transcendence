import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';

export default async function deleteAccount(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/delete-account', async (request, reply) =>
	{
		const { username } = request.body as { username: string };
		// console.log(username);
		try
		{
			const deleted = await prisma.account.delete({ where: { username } });
			console.log(deleted);
			return reply.send({ success: true});
		}
		catch (error)
		{
			return reply.status(500).send({ error: 'Account deletion failed' });
		}
	});
}
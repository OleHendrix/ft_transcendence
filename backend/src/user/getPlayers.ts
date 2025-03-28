import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';

export default async function getPlayers(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.get('/api/getplayers', async (request, reply) => 
	{
		try
		{
			const players = await prisma.account.findMany();
			return reply.send({ success: true, players });
		}
		catch (error)
		{
			return reply.status(500).send({ error: 'Error getting players from database' });
		}
	});
}
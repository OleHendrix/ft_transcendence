import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { notifyClients } from "./createWebsocket";


export default async function unblockUser(server: FastifyInstance, prisma: PrismaClient) {
	server.post('/api/unblock-user',
		{
			preHandler: server.authenticate
		},
		async (request, reply) =>
	{
		const { senderId, receiverId } = request.body as { senderId: number, receiverId: number };
		if (receiverId === -1) return ;

		const block = await prisma.block.findFirst({
			where: {
				blockerId: senderId,
				blockedId: receiverId
			}
		});

		if (!block) return ;
		
		await prisma.block.delete({
			where: { id: block.id }
		});
		notifyClients(block);
		return reply.send({ succes: true });
	});
}

import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { notifyClients } from "./createWebsocket";

export default async function blockUser(server: FastifyInstance, prisma: PrismaClient) {
	server.post('/api/block-user', async (request, reply) => {
		const { senderId, receiverId } = request.body as { senderId: number, receiverId: number };
		if (receiverId === -1) return ;

		let block = await prisma.block.findFirst({
			where: {
				blockerId: senderId,
				blockedId: receiverId
			}
		});

		if (!block)
		{
			block = await prisma.block.create(
			{
				data:
				{
					blockerId: senderId,
					blockedId: receiverId,
				}
			});
		}
		notifyClients(block);
		return reply.send({ succes: true });
	});
}

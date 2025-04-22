import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { getOrCreateChatSession } from "./chatUtils/getOrCreateChatSession";
import { notifyClients } from "./createWebsocket";


export default async function sendMessage(server: FastifyInstance, prisma: PrismaClient)
{
	server.post('/api/send-message', async (request, reply) =>
	{
		const { senderId, receiverId, content, status } = request.body as { senderId: number; receiverId: number; content: string, status: number };

		const chatSession = await getOrCreateChatSession(senderId, receiverId);
		const message = await prisma.message.create(
		{
			data:
			{
				content,
				senderId: senderId,
				receiverId: (receiverId === -1 ? 1 : receiverId),
				chatSessionId: chatSession.id,
				status: status as number,
			},
			include: { sender: { select: { username: true } } }
		});

		const messageToClient =
		{
			id: message.id,
			content: message.content,
			timestamp: message.timestamp,
			senderUsername: message.sender.username,
			chatSessionId: message.chatSessionId,
			status: message.status
		};

		if (messageToClient.status != 5)
			notifyClients(messageToClient);
		return reply.send({ success: true, messageToClient });
	});
}

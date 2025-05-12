import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { getOrCreateChatSession } from "./chatUtils/getOrCreateChatSession";
import { notifyClients } from "./createWebsocket";

export default async function setMsgStatus(server: FastifyInstance, prisma: PrismaClient) {
	server.post('/api/change-msg-status',
		{
			preHandler: server.authenticate
		},
		async (request, reply) =>
	{
		try {
			const { senderId, receiverId, status, messageId } = request.body as {
				senderId: number;
				receiverId: number;
				status: number;
				messageId: number;
			};

			if (!messageId) {
				console.error("❌ Error: messageId is missing!");
				return reply.status(400).send({ error: "messageId is required" });
			}

			const chatSession = await getOrCreateChatSession(senderId, receiverId);

			const update = await prisma.message.update({
				where: {
					chatSessionId: chatSession.id,
					id: messageId,
				},
				data: {
					status: status,
				},
			});
			notifyClients(update);
			reply.send({ success: true, message: "Message status updated successfully." });
		} catch (error) {
			console.error("Error updating message status:", error);
			reply.status(500).send({ success: false, error: "Failed to update message status." });
		}
	});
}

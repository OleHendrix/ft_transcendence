import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
// chat/chat.ts (or wherever needed)
import { getOrCreateChatSession } from "./chatUtils/getOrCreateChatSession";
import { getBlockedUserIds } from "./chatUtils/getBlockedUserIds"
import { triggerAsyncId } from "async_hooks";


export default async function getMessages(server: FastifyInstance, prisma: PrismaClient)
{
	// server.get("/api/get-chatsession", async (request, reply) =>
	// {
	// 	const { senderId, receiverId } = request.query as { senderId: string; receiverId: string };
	// 	const senderIdNum = parseInt(senderId);
	// 	const receiverIdNum = parseInt(receiverId);

	// 	try
	// 	{
	// 		const chatSession = await getOrCreateChatSession(senderIdNum, receiverIdNum);
	// 		if (chatSession)
	// 			reply.send({ success: true, chatSessionId: chatSession.id})
	// 	}
	// 	catch (error: any)
	// 	{
	// 		console.log(error.response)
	// 		reply.status(500).send({ success: false, error: "Error getting chatSession" })
	// 	}
	// })


	server.get('/api/get-messages',
		{
			preHandler: server.authenticate
		},
		async (request, reply) =>
	{
		try {
			const { senderId, receiverId } = request.query as { senderId: string; receiverId: string };
			const senderIdNum = parseInt(senderId);
			const receiverIdNum = parseInt(receiverId);

			const chatSession = await getOrCreateChatSession(senderIdNum, receiverIdNum);
			const blockedUserIds = await getBlockedUserIds (senderIdNum);
	
			const messages = await prisma.message.findMany({
				where: { 
					chatSessionId: chatSession.id, 
					senderId: { notIn: blockedUserIds }
				},
				orderBy: { timestamp: 'asc' },
				include: {
					sender: {
						select: { username: true }
					}
				}
			});

			const transformedMessages = messages.map(({ id, content, timestamp, sender, senderId, chatSessionId, status }) => ({
				id,
				content,
				timestamp,
				senderUsername: sender.username,
				senderId,
				chatSessionId,
				status
			}));
	
			reply.send({ success: true, messages: transformedMessages, chatSessionId: chatSession.id });
		} catch (error) {
			console.error("Error in /api/get-messages:", error);
			reply.status(500).send({ success: false, error: "Internal Server Error" });
		}
	});
}

import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { getOrCreateChatSession } from "./chatUtils/getOrCreateChatSession";
import { notifyClients } from "./createWebsocket";

export default async function sendFriendship(server: FastifyInstance, prisma: PrismaClient)
{
	server.post('/api/update-friendship',
		{
			preHandler: server.authenticate
		},
		async (request, reply) =>
	{
		const { senderId, receiverId, status, messageId } = request.body as { senderId: number; receiverId: number; status: number; messageId: number;};
		try
		{
			if (!messageId)
			{
				console.error("❌ Error: messageId is missing!");
				return reply.status(400).send({ error: "messageId is required" });
			}
			const friendship = await prisma.friendship.findFirst(
			{
				where: 
				{ OR:
					[
						{ requesterId: senderId, receiverId: receiverId }, { requesterId: receiverId, receiverId: senderId }
					]
				}
			});
			if (friendship && !friendship.accepted)
			{
				if (status === 3 || status === 4)
					await prisma.friendship.delete({where: { id: friendship.id }});
				else
					await prisma.friendship.update({where: { id: friendship.id }, data: { accepted: true }});
			}

			const chatSession = await getOrCreateChatSession(senderId, receiverId);
			const update = await prisma.message.update(
			{
				where:
				{
					chatSessionId: chatSession.id,
					id: messageId,
				},
				data: { status: status}
			});

			await prisma.message.deleteMany(
			{
				where:
				{
					chatSessionId: chatSession.id,
					content: "::friendRequest::",
					NOT: { id: messageId}
				}
			});
			notifyClients(update);
			reply.send({ success: true, message: "Message status updated successfully." });
		} 
		catch (error) 
		{
			console.error("Error updating message status:", error);
			reply.status(500).send({ success: false, error: "Failed to update message status." });
		}
	})

	server.post('/api/send-friendship', async (request, reply) =>
	{
		const { requesterId, receiverId } = request.body as { requesterId: number; receiverId: number };
		const friendship = await prisma.friendship.findFirst(
		{
			where: 
			{ OR:
				[
					{ requesterId: requesterId, receiverId: receiverId }, { requesterId: receiverId, receiverId: requesterId }
				]
			}
		});
		if (!friendship)
		{
			await prisma.friendship.create
			(
			{
				data:
				{
					requesterId: requesterId,
					receiverId: receiverId
				}
			});
		}

		const chatSession = await getOrCreateChatSession(requesterId, receiverId);
		const message = await prisma.message.create(
		{
			data:
			{
				content: '::friendRequest::',
				senderId: requesterId,
				receiverId: receiverId,
				chatSessionId: chatSession.id,
				status: 1,
			},
			include: { sender: { select: { username: true } } }
		});

		return reply.send({ success: true });
	});
	

}

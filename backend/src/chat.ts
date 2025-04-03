import { FastifyInstance } 	from 'fastify';
import { PrismaClient } 	from '@prisma/client';
import WebSocket 			from 'ws';

const prisma 		= new PrismaClient();
const activeChats	= new Map<number, Set<WebSocket>>();

export async function setupChat(server: FastifyInstance)
{
	server.register(async function (server)
	{
		server.get("/ws/chat", { websocket: true }, (connection, req) =>
		{
			const query = req.query as { chatSessionId?: string};
			
			const chatSessionId = query.chatSessionId ? Number(query.chatSessionId) : undefined;
			if (!chatSessionId)
			{
				console.log("/ws/chat: invalid chatSessionId passed to API call, closing connection");
				connection.close();
				return;
			}

			if (!activeChats.has(chatSessionId))
				activeChats.set(chatSessionId, new Set());

			activeChats.get(chatSessionId)!.add(connection);
			console.log(`Chatsession ${chatSessionId} connected to WebSocket`);
			
			connection.on("close", () =>
			{
				console.log(`User ${chatSessionId} disconnected`);
				activeChats.get(chatSessionId)!.delete(connection);
				if (activeChats.get(chatSessionId)!.size === 0)
				{
					console.log(`chatSessionId ${chatSessionId} no longer active, removing from active chats`);
					activeChats.delete(chatSessionId);
				}
			});
		})
	});

	server.get("/api/get-messages", async (request, reply) => {
		try {
			const { senderId, receiverId } = request.query as { senderId: string; receiverId: string };
			const senderIdNum = parseInt(senderId);
			const receiverIdNum = parseInt(receiverId);

			const chatSession = await getOrCreateChatSession(senderIdNum, receiverIdNum);
	
			const messages = await prisma.message.findMany({
				where: { chatSessionId: chatSession.id },
				orderBy: { timestamp: 'asc' },
				include: {
					sender: {
						select: { username: true }
					}
				}
			});
	
			// Transform messages before sending response
			const transformedMessages = messages.map(({ id, content, timestamp, sender, chatSessionId, status }) => ({
				id,
				content,
				timestamp,
				senderUsername: sender.username,
				chatSessionId, 
				status
			}));
	
			reply.send({ success: true, messages: transformedMessages, chatSessionId: chatSession.id });
		} catch (error) {
			console.error("Error in /api/get-messages:", error);
			reply.status(500).send({ success: false, error: "Internal Server Error" });
		}
	});

	server.post('/api/change-msg-status', async (request, reply) => {
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

			await prisma.message.update({
				where: {
					chatSessionId: chatSession.id,
					id: messageId,
				},
				data: {
					status: status,
				},
			});
	
			reply.send({ success: true, message: "Message status updated successfully." });
		} catch (error) {
			console.error("Error updating message status:", error);
			reply.status(500).send({ success: false, error: "Failed to update message status." });
		}
	});

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

		notifyClients(messageToClient);
		return reply.send({ success: true, messageToClient });
	});

	async function getOrCreateChatSession(senderId: number, receiverId: number) {
		if (receiverId === -1) //globalchat
		{
			let chatSession = await prisma.chatSession.findFirst({ where: { account1Id: 1, account2Id: 1 }});
			if (!chatSession)
				chatSession = await prisma.chatSession.create({ data: { account1Id: 1, account2Id: 1 } });
			return chatSession;
		}

		let chatSession = await prisma.chatSession.findFirst({
			where: {
				OR: [
					{ account1Id: senderId, 	account2Id: receiverId },
					{ account1Id: receiverId, 	account2Id: senderId },
				]
			}
		});

		if (!chatSession) {
			chatSession = await prisma.chatSession.create({ data: { account1Id: senderId, account2Id: receiverId } });
		}
		return chatSession;
	}

	async function notifyClients(newMessage: any)
	{
		const { chatSessionId } = newMessage;
		const activeChatSockets = activeChats.get(chatSessionId);
		// console.log(`Notifying all clients connected to ChatSessionId ${chatSessionId}`);

		if (activeChatSockets)
		{
			activeChatSockets.forEach(socket =>
			{
				if (socket.readyState === WebSocket.OPEN)
				{
					socket.send(JSON.stringify(newMessage));
					console.log("client notified");
				}
			})
		}
	}
}

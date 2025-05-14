import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { getOrCreateChatSession } from "./chatUtils/getOrCreateChatSession";
import WebSocket 			from 'ws';

const activeChats	= new Map<number, Set<WebSocket>>();

export default async function createWebsocket(server: FastifyInstance, prisma: PrismaClient) {
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
			// console.log(`Chatsession ${chatSessionId} connected to WebSocket`);
			
			connection.on("close", () =>
			{
				// console.log(`User ${chatSessionId} disconnected`);
				activeChats.get(chatSessionId)!.delete(connection);
				if (activeChats.get(chatSessionId)!.size === 0)
				{
					// console.log(`chatSessionId ${chatSessionId} no longer active, removing from active chats`);
					activeChats.delete(chatSessionId);
				}
			});
		})
	});

	server.post('/api/send-istyping', async (request, reply) =>
		{
			const { senderId, receiverId } = request.body as { senderId: number; receiverId: number}
			const chatSession = await getOrCreateChatSession(senderId, receiverId);
			const activeChatSockets = activeChats.get(chatSession.id);
			const user = await prisma.account.findUnique({ where: {id: senderId}})
	
			if (activeChatSockets)
			{
				activeChatSockets.forEach(socket =>
				{
					if (socket.readyState === WebSocket.OPEN)
					{
						socket.send(JSON.stringify({ isTyping: user?.username }));
						return reply.send({ success: true });
					}
				})
			}
			reply.status(404).send({ success: false, error: "Failed to send isTyping notification" });
		});
}

export async function notifyClients(newMessage: any)
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
				// console.log("client notified");
			}
		})
	}
}

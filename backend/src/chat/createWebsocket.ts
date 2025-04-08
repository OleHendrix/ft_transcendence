import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
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
				console.log("client notified");
			}
		})
	}
}

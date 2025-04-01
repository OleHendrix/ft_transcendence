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
			const query = req.query as { chatSessionId?: string };
			const chatSessionId = query.chatSessionId ? Number(query.chatSessionId) : undefined;
			if (!chatSessionId)
			{
				console.log("chatSessionId parse failed");
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
					activeChats.delete(chatSessionId);
			});
		})
	});

	server.get("/api/get-messages", async (request, reply) =>
	{
		const { senderUsername, receiverUsername } = request.query as { senderUsername: string; receiverUsername: string };
		
		let chatSession = await prisma.chatSession.findFirst(
		{
			where:
			{
				OR: 
				[
					{ username1: senderUsername, username2: receiverUsername },
					{ username1: receiverUsername, username2: senderUsername }
				]
			}
		});
		
		if (!chatSession)
		{
			chatSession = await prisma.chatSession.create(
			{
				data:
				{ 
					username1: senderUsername,
					username2: receiverUsername
				}
			});
		}

		const messages = await prisma.message.findMany(
		{
			where: { chatSessionId: chatSession.id },
			orderBy: { timestamp: 'asc' }
		});

		return (reply.send({ success: true, messages: messages, chatSessionId: chatSession.id}));
	});

	async function notifyClients(newMessage: any)
	{
		const { chatSessionId } = newMessage;
		// console.log("notifyClient csid", chatSessionId);
		const activeChatSockets = activeChats.get(chatSessionId);
		
		if (activeChatSockets)
		{
			activeChatSockets.forEach(socket =>
			{
				if (socket.readyState === WebSocket.OPEN)
					socket.send(JSON.stringify(newMessage));
			})
		}
	}
	
	server.post('/api/send-message', async (request, reply) =>
	{
		const { senderUsername, receiverUsername, content } = request.body as { senderUsername: string; receiverUsername: string; content: string };
		const sender = await prisma.account.findUnique({ where: { username: senderUsername } });
		const receiver = await prisma.account.findUnique({ where: { username: receiverUsername } });
		if (!sender || !receiver)
			return reply.status(400).send({ error: 'Api/sendMessage:Invalid_sender/receiver' });

		let chatSession = await prisma.chatSession.findFirst(
		{
			where:
			{
				OR: [{ username1: senderUsername, username2: receiverUsername }, { username1: receiverUsername, username2: senderUsername }]
			}
		});
	
		if (!chatSession)
		{
			chatSession = await prisma.chatSession.create(
			{
				data:
				{ 
					username1: senderUsername,
					username2: receiverUsername
				}
			});
		}
	
		const message = await prisma.message.create(
		{
			data:
			{
				content,
				senderUsername,
				receiverUsername,
				chatSessionId: chatSession.id
			}
		});

		notifyClients(message);
		return reply.send({ success: true, message });
	});
}}

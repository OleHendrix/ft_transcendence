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
		const { senderId, receiverId } = request.query as { senderId: string; receiverId: string };
		const senderIdNum = parseInt(senderId as string);
		const receiverIdNum = parseInt(receiverId as string);

		let chatSession;

		// if (receiverIdNum === -1)
		// {
		// 	chatSession = await prisma.chatSession.findFirst(
		// 	{
		// 		where:
		// 		{
		// 			account1Id: -1,
		// 			account2Id: -1 
		// 		}
		// 	});
		// 	if (!chatSession)
		// 	{
		// 		chatSession = await prisma.chatSession.create(
		// 		{
		// 			data:
		// 			{ 
		// 				account1Id: -1,
		// 				account2Id: -1 
		// 			}
		// 		});
		// 	}
		// }
		// else
		// {
			chatSession = await prisma.chatSession.findFirst(
			{
				where:
				{
					OR: 
					[
						{ account1Id: senderIdNum, account2Id: receiverIdNum },
						{ account1Id: receiverIdNum, account2Id: senderIdNum }
					]
				}
			});
			
			if (!chatSession)
			{
				chatSession = await prisma.chatSession.create(
				{
					data:
					{ 
						account1Id: senderIdNum,
						account2Id: receiverIdNum
					}
				});
			}
		// }
		const messages = await prisma.message.findMany(
		{
			where: { chatSessionId: chatSession.id },
			orderBy: { timestamp: 'asc' },
			include:
			{
				sender:
				{
					select:
					{
						username: true,
					}
				}
			}
		});
		
		const transformedMessages = messages.map(message => (
		{
			content: message.content,
			timestamp: message.timestamp,
			senderUsername: message.sender.username,
			chatSessionId: message.chatSessionId
		}));

		return (reply.send({ success: true, messages: transformedMessages, chatSessionId: chatSession.id}));
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
		const { senderId, receiverId, content } = request.body as { senderId: number; receiverId: number; content: string };
		const sender = await prisma.account.findUnique({ where: { id: senderId } });
		const receiver = await prisma.account.findUnique({ where: { id: receiverId } });
		if (!sender || !receiver)
			return reply.status(400).send({ error: 'Api/sendMessage:Invalid_sender/receiver' });

		let chatSession;

		// if (receiverId === -1)
		// {
		// 	chatSession = await prisma.chatSession.findFirst(
		// 	{
		// 		where:
		// 		{
		// 			account1Id: -1,
		// 			account2Id: -1,
		// 		}

		// 	}
		// 	)
		// }



		chatSession = await prisma.chatSession.findFirst(
		{
			where:
			{
				OR: [{ account1Id: senderId, account2Id: receiverId }, { account1Id: receiverId, account2Id: senderId }]
			}
		});
	
		if (!chatSession)
		{
			chatSession = await prisma.chatSession.create(
			{
				data:
				{ 
					account1Id: senderId,
					account2Id: receiverId
				}
			});
		}
	
		const message = await prisma.message.create(
		{
			data:
			{
				content,
				senderId,
				receiverId,
				chatSessionId: chatSession.id
			},
			include:
			{
				sender:
				{
					select:
					{
						username: true
					}
				}
			}
		});
		
		const messageToClient =
		{
    		content: message.content,
    		timestamp: message.timestamp,
			senderUsername: message.sender.username,
			chatSessionId: message.chatSessionId
		};

		notifyClients(messageToClient);
		return reply.send({ success: true, messageToClient });
	});
}

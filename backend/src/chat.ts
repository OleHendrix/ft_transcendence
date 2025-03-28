import { FastifyInstance } 	from 'fastify';
import { PrismaClient } 	from '@prisma/client';
import fastifyWebsocket 	from '@fastify/websocket';

const prisma 		= new PrismaClient();
const activeChats 	= new Map<number, Set<WebSocket>>();

export async function setupChat(server: FastifyInstance)
{
	server.register(fastifyWebsocket);

	server.get("/ws/chat", { websocket: true }, (connection, req) => {
		const url = new URL(connection.raw.url, "http://localhost");

		const chatSessionId  = Number(url.searchParams.get("chatSessionId"));
		if (!chatSessionId) {
			console.log("chat session socket failed");
			connection.socket.close();
			return;
		}

		console.log(`Chatsession ${chatSessionId} connected to WebSocket`);

		activeChats.get(chatSessionId)!.add(connection.socket);

		connection.socket.on("close", () => {
			console.log(`User ${chatSessionId} disconnected`);
			activeChats.get(chatSessionId)!.delete(connection.socket);
			if (activeChats.get(chatSessionId)!.size === 0) {
				activeChats.delete(chatSessionId);
			}
		});
	})

	server.get("/api/get-messages", async (request, reply) =>
	{

		const { senderId, receiverId } = request.query as { senderId: string; receiverId: string };
		
		const senderIdNum = parseInt(senderId as string);
		const receiverIdNum = parseInt(receiverId as string);
		
		
		let chatSession = await prisma.chatSession.findFirst({
			where: {
				OR: [
					{ account1Id: senderIdNum, account2Id: receiverIdNum },
					{ account1Id: receiverIdNum, account2Id: senderIdNum }
				]
			}
		});
		
		if (!chatSession)
		{
			chatSession = await prisma.chatSession.create({
				data:
				{ 
					account1Id: senderIdNum,
					account2Id: receiverIdNum
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

	async function notifyClients(newMessage: any) {
		const { chatSessionId } = newMessage;
		console.log("notifyclient csid", chatSessionId);
		const activeChatSockets = activeChats.get(chatSessionId);
		
		if (activeChatSockets) {

		}
	}

	
	server.post('/api/send-message', async (request, reply) =>
	{
		const { senderId, receiverId, content } = request.body as { senderId: number; receiverId: number; content: string };
		const sender = await prisma.account.findUnique({ where: { id: senderId } });
		const receiver = await prisma.account.findUnique({ where: { id: receiverId } });
		
		if (!sender || !receiver)
			return reply.status(400).send({ error: 'Api/sendMessage:Invalid_sender/receiver' });

		let chatSession = await prisma.chatSession.findFirst(
		{
			where:
			{
				OR: [{ account1Id: senderId, account2Id: receiverId }, { account1Id: receiverId, account2Id: senderId }]
			}
		});
	
		if (!chatSession)
		{
			chatSession = await prisma.chatSession.create({
				data:
				{ 
					account1Id: senderId,
					account2Id: receiverId
				}
			});
		}
	
		const message = await prisma.message.create({
			data:
			{
				content,
				senderId,
				receiverId,
				chatSessionId: chatSession.id
			}
		});

		notifyClients(message);
		
		return reply.send({ success: true, message });
	});
}

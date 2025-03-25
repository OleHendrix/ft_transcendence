import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import fastifyWebsocket from '@fastify/websocket';

const prisma = new PrismaClient();
const globalChatClients: Set<any> = new Set();

interface PrivateChatParams
{
	senderId: number,
	receiverId: number
}


export async function setupChat(server: FastifyInstance) {
	server.register(fastifyWebsocket);

	server.get("/chat", { websocket: true }, (connection, req) => {
		console.log("New WebSocket connection for global chatroom");

		globalChatClients.add(connection);
		
		connection.socket.on("message", async (message: string) => {
			console.log("Recieved message in global chat:", message);

			globalChatClients.forEach(client => {
				if (client !== connection) {
					client.socket.send(message);
				}
			});
		});

		connection.socket.on("close", () => {
			console.log("Connection closed for global chat");
			globalChatClients.delete(connection);
		});
	});

	server.get("/api/get-messages", async (request, reply) => {

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
		
		if (!chatSession) {
		chatSession = await prisma.chatSession.create({
			data: { 
			account1Id: senderIdNum,
			account2Id: receiverIdNum
			}
		});
		}

		const messages = await prisma.message.findMany({
				where:
				{
					chatSessionId: chatSession.id
				},
				orderBy:
				{
					timestamp: 'asc'
				}
		});

		return (reply.send({ success: true, messages: messages}));
	});

	// server.get("/api/get-messages", { websocket: true}, async (connection, req) => {
	// 	// console.log(req);
	// 	const { senderId, receiverId } = req.query as { senderId: number; receiverId: number }//PrivateChatParams;

	// 	console.log(`New WebSocket connection for private chat with user ${receiverId}`);
		
	// 	let chatSession = await prisma.chatSession.findFirst({
	// 	where: {
	// 		OR: [
	// 		{ account1Id: senderId, account2Id: receiverId },
	// 		{ account1Id: receiverId, account2Id: senderId }
	// 		]
	// 	}
	// 	});
		
	// 	if (!chatSession) {
	// 	chatSession = await prisma.chatSession.create({
	// 		data: { 
	// 		account1Id: senderId,
	// 		account2Id: receiverId
	// 		}
	// 	});
	// 	}

	// 	const messages = await prisma.message.findMany({
	// 			where:
	// 			{
	// 				chatSessionId: chatSession.id
	// 			},
	// 			orderBy:
	// 			{
	// 				timestamp: 'desc'
	// 			}
	// 	});

	// 	connection.socket.send(JSON.stringify({
    //   	  	type: 'initial-messages',
    //     	messages: messages
    // 	}));

	// 	connection.socket.on("close", () => {
	// 		console.log("Connection closed for private chat");
	// 	});
	// });
	
	
	// Chat message sending route (not WebSocket yet)
	server.post('/api/send-message', async (request, reply) => {
		
		const { senderId, receiverId, content } = request.body as { senderId: number; receiverId: number; content: string };
		// Check if users exist
		const sender = await prisma.account.findUnique({ where: { id: senderId } });
		const receiver = await prisma.account.findUnique({ where: { id: receiverId } });
		
		if (!sender || !receiver) {
			return reply.status(400).send({ error: 'Invalid sender or receiver' });
		}

		// const isBlocked = await prisma.block.findFirst({
		// 	where: { blockerId: Number(receiverId), blockedId: Number(senderId) }
		// });

		// if (isBlocked) {
		// 	console.log(`User ${senderId} is blocked bij ${receiverId}, closing connection`);
		// 	connection.socket.send("You are blocked by this user");
		// 	connection.socket.close();
		// 	return ;
		// }
		
		// Create a chat session or find an existing one
		let chatSession = await prisma.chatSession.findFirst({
		where: {
			OR: [
			{ account1Id: senderId, account2Id: receiverId },
			{ account1Id: receiverId, account2Id: senderId }
			]
		}
		});
		
		if (!chatSession) {
		chatSession = await prisma.chatSession.create({
			data: { 
			account1Id: senderId,
			account2Id: receiverId
			}
		});
		}
		
		// Save the message to the database
		const message = await prisma.message.create({
		data: {
			content,
			senderId,
			receiverId,
			chatSessionId: chatSession.id
		}
		});
		
		return reply.send({ success: true, message });
	});
}

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import fastifyWebsocket from '@fastify/websocket';

const prisma = new PrismaClient();
const globalChatClients: Set<any> = new Set();

interface PrivateChatParams {
	receiverId: string;
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

	server.get("/chat/private/:receiverId", { websocket: true}, (connection, req) => {
		const senderId = req.headers["x-user-id"];
		const { receiverId } = req.params as PrivateChatParams;

		console.log('New WebSocket connection for private chat with user ${receiverId');

		connection.socket.on("message", async (message: string) => {
			console.log('Received private message from ${senderId} to ${receiverId}:', message);

			connection.socket.sent('message sent to user ${receiverId} to ${senderId}:', message);
		});

		connection.socket.on("close", () => {
			console.log("Connection closed for private chat");
		});
	});


	// Chat message sending route (not WebSocket yet)
	server.post('/api/send-message', async (request, reply) => {
		const { senderId, receiverId, content } = request.body as { senderId: number; receiverId: number; content: string };

		// Check if users exist
		const sender = await prisma.account.findUnique({ where: { id: senderId } });
		const receiver = await prisma.account.findUnique({ where: { id: receiverId } });

		if (!sender || !receiver) {
			return reply.status(400).send({ error: 'Invalid sender or receiver' });
		}

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

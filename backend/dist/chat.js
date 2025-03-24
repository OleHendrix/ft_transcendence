"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupChat = setupChat;
const client_1 = require("@prisma/client");
const websocket_1 = __importDefault(require("@fastify/websocket"));
const prisma = new client_1.PrismaClient();
const globalChatClients = new Set();
function setupChat(server) {
    return __awaiter(this, void 0, void 0, function* () {
        server.register(websocket_1.default);
        server.get("/chat", { websocket: true }, (connection, req) => {
            console.log("New WebSocket connection for global chatroom");
            globalChatClients.add(connection);
            connection.socket.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
                console.log("Recieved message in global chat:", message);
                globalChatClients.forEach(client => {
                    if (client !== connection) {
                        client.socket.send(message);
                    }
                });
            }));
            connection.socket.on("close", () => {
                console.log("Connection closed for global chat");
                globalChatClients.delete(connection);
            });
        });
        server.get("/chat/private/:receiverId", { websocket: true }, (connection, req) => {
            const senderId = req.headers["x-user-id"];
            const { receiverId } = req.params;
            console.log('New WebSocket connection for private chat with user ${receiverId');
            connection.socket.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
                console.log('Received private message from ${senderId} to ${receiverId}:', message);
                connection.socket.sent('message sent to user ${receiverId} to ${senderId}:', message);
            }));
            connection.socket.on("close", () => {
                console.log("Connection closed for private chat");
            });
        });
        // Chat message sending route (not WebSocket yet)
        server.post('/api/send-message', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { senderId, receiverId, content } = request.body;
            // Check if users exist
            const sender = yield prisma.account.findUnique({ where: { id: senderId } });
            const receiver = yield prisma.account.findUnique({ where: { id: receiverId } });
            if (!sender || !receiver) {
                return reply.status(400).send({ error: 'Invalid sender or receiver' });
            }
            // Create a chat session or find an existing one
            let chatSession = yield prisma.chatSession.findFirst({
                where: {
                    OR: [
                        { account1Id: senderId, account2Id: receiverId },
                        { account1Id: receiverId, account2Id: senderId }
                    ]
                }
            });
            if (!chatSession) {
                chatSession = yield prisma.chatSession.create({
                    data: {
                        account1Id: senderId,
                        account2Id: receiverId
                    }
                });
            }
            // Save the message to the database
            const message = yield prisma.message.create({
                data: {
                    content,
                    senderId,
                    receiverId,
                    chatSessionId: chatSession.id
                }
            });
            return reply.send({ success: true, message });
        }));
    });
}

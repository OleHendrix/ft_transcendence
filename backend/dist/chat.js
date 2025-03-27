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
                    if (client !== connection)
                        client.socket.send(message);
                });
            }));
            connection.socket.on("close", () => {
                console.log("Connection closed for global chat");
                globalChatClients.delete(connection);
            });
        });
        server.get("/api/get-messages", (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { senderId, receiverId } = request.query;
            const senderIdNum = parseInt(senderId);
            const receiverIdNum = parseInt(receiverId);
            let chatSession = yield prisma.chatSession.findFirst({
                where: {
                    OR: [{ account1Id: senderIdNum, account2Id: receiverIdNum }, { account1Id: receiverIdNum, account2Id: senderIdNum }]
                }
            });
            if (!chatSession) {
                chatSession = yield prisma.chatSession.create({
                    data: {
                        account1Id: senderIdNum,
                        account2Id: receiverIdNum
                    }
                });
            }
            const messages = yield prisma.message.findMany({
                where: {
                    chatSessionId: chatSession.id
                },
                orderBy: {
                    timestamp: 'asc'
                }
            });
            return (reply.send({ success: true, messages: messages }));
        }));
        server.post('/api/send-message', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { senderId, receiverId, content } = request.body;
            const sender = yield prisma.account.findUnique({ where: { id: senderId } });
            const receiver = yield prisma.account.findUnique({ where: { id: receiverId } });
            if (!sender || !receiver)
                return reply.status(400).send({ error: 'Invalid sender or receiver' });
            let chatSession = yield prisma.chatSession.findFirst({
                where: {
                    OR: [{ account1Id: senderId, account2Id: receiverId }, { account1Id: receiverId, account2Id: senderId }]
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

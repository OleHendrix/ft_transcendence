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
const ws_1 = __importDefault(require("ws"));
const prisma = new client_1.PrismaClient();
const activeChats = new Map();
function setupChat(server) {
    return __awaiter(this, void 0, void 0, function* () {
        server.register(function (server) {
            return __awaiter(this, void 0, void 0, function* () {
                server.get("/ws/chat", { websocket: true }, (connection, req) => {
                    const query = req.query;
                    const chatSessionId = query.chatSessionId ? Number(query.chatSessionId) : undefined;
                    if (!chatSessionId) {
                        console.log("chatSessionId parse failed");
                        connection.close();
                        return;
                    }
                    if (!activeChats.has(chatSessionId))
                        activeChats.set(chatSessionId, new Set());
                    activeChats.get(chatSessionId).add(connection);
                    // console.log(`Chatsession ${chatSessionId} connected to WebSocket`);
                    connection.on("close", () => {
                        // console.log(`User ${chatSessionId} disconnected`);
                        activeChats.get(chatSessionId).delete(connection);
                        if (activeChats.get(chatSessionId).size === 0)
                            activeChats.delete(chatSessionId);
                    });
                });
            });
        });
        server.get("/api/get-messages", (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { senderUsername, receiverUsername } = request.query;
            let chatSession = yield prisma.chatSession.findFirst({
                where: {
                    OR: [
                        { username1: senderUsername, username2: receiverUsername },
                        { username1: receiverUsername, username2: senderUsername }
                    ]
                }
            });
            if (!chatSession) {
                chatSession = yield prisma.chatSession.create({
                    data: {
                        username1: senderUsername,
                        username2: receiverUsername
                    }
                });
            }
            const messages = yield prisma.message.findMany({
                where: { chatSessionId: chatSession.id },
                orderBy: { timestamp: 'asc' }
            });
            return (reply.send({ success: true, messages: messages, chatSessionId: chatSession.id }));
        }));
        function notifyClients(newMessage) {
            return __awaiter(this, void 0, void 0, function* () {
                const { chatSessionId } = newMessage;
                // console.log("notifyClient csid", chatSessionId);
                const activeChatSockets = activeChats.get(chatSessionId);
                if (activeChatSockets) {
                    activeChatSockets.forEach(socket => {
                        if (socket.readyState === ws_1.default.OPEN)
                            socket.send(JSON.stringify(newMessage));
                    });
                }
            });
        }
        server.post('/api/send-message', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { senderUsername, receiverUsername, content } = request.body;
            const sender = yield prisma.account.findUnique({ where: { username: senderUsername } });
            const receiver = yield prisma.account.findUnique({ where: { username: receiverUsername } });
            if (!sender || !receiver)
                return reply.status(400).send({ error: 'Api/sendMessage:Invalid_sender/receiver' });
            let chatSession = yield prisma.chatSession.findFirst({
                where: {
                    OR: [{ username1: senderUsername, username2: receiverUsername }, { username1: receiverUsername, username2: senderUsername }]
                }
            });
            if (!chatSession) {
                chatSession = yield prisma.chatSession.create({
                    data: {
                        username1: senderUsername,
                        username2: receiverUsername
                    }
                });
            }
            const message = yield prisma.message.create({
                data: {
                    content,
                    senderUsername,
                    receiverUsername,
                    chatSessionId: chatSession.id
                }
            });
            notifyClients(message);
            return reply.send({ success: true, message });
        }));
    });
}

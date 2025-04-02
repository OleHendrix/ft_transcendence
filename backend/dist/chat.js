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
                        console.log("/ws/chat: invalid chatSessionId passed to API call, closing connection");
                        connection.close();
                        return;
                    }
                    if (!activeChats.has(chatSessionId))
                        activeChats.set(chatSessionId, new Set());
                    activeChats.get(chatSessionId).add(connection);
                    console.log(`Chatsession ${chatSessionId} connected to WebSocket`);
                    connection.on("close", () => {
                        console.log(`User ${chatSessionId} disconnected`);
                        activeChats.get(chatSessionId).delete(connection);
                        if (activeChats.get(chatSessionId).size === 0) {
                            console.log(`chatSessionId ${chatSessionId} no longer active, removing from active chats`);
                            activeChats.delete(chatSessionId);
                        }
                    });
                });
            });
        });
        server.get("/api/get-messages", (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { senderId, receiverId } = request.query;
                const senderIdNum = parseInt(senderId);
                const receiverIdNum = parseInt(receiverId);
                const chatSession = yield getOrCreateChatSession(senderIdNum, receiverIdNum);
                const messages = yield prisma.message.findMany({
                    where: { chatSessionId: chatSession.id },
                    orderBy: { timestamp: 'asc' },
                    include: {
                        sender: {
                            select: { username: true }
                        }
                    }
                });
                // Transform messages before sending response
                const transformedMessages = messages.map(({ content, timestamp, sender, chatSessionId }) => ({
                    content,
                    timestamp,
                    senderUsername: sender.username,
                    chatSessionId
                }));
                reply.send({ success: true, messages: transformedMessages, chatSessionId: chatSession.id });
            }
            catch (error) {
                console.error("Error in /api/get-messages:", error);
                reply.status(500).send({ success: false, error: "Internal Server Error" });
            }
        }));
        server.post('/api/send-message', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { senderId, receiverId, content } = request.body;
            const chatSession = yield getOrCreateChatSession(senderId, receiverId);
            const message = yield prisma.message.create({
                data: {
                    content,
                    senderId: senderId,
                    receiverId: (receiverId === -1 ? 1 : receiverId),
                    chatSessionId: chatSession.id
                },
                include: { sender: { select: { username: true } } }
            });
            const messageToClient = {
                content: message.content,
                timestamp: message.timestamp,
                senderUsername: message.sender.username,
                chatSessionId: message.chatSessionId
            };
            notifyClients(messageToClient);
            return reply.send({ success: true, messageToClient });
        }));
        server.post('/api/send-game-invite', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { senderId, receiverId, content } = request.body;
            const chatSession = yield getOrCreateChatSession(senderId, receiverId);
            const message = yield prisma.message.create({
                data: {
                    content,
                    senderId: senderId,
                    receiverId: (receiverId === -1 ? 1 : receiverId),
                    chatSessionId: chatSession.id,
                    isGameInvite: true
                },
                include: { sender: { select: { username: true } } }
            });
            const messageToClient = {
                content: message.content,
                timestamp: message.timestamp,
                senderUsername: message.sender.username,
                chatSessionId: message.chatSessionId,
                isGameInvite: true
            };
            notifyClients(messageToClient);
            return reply.send({ success: true, messageToClient });
        }));
        function getOrCreateChatSession(senderId, receiverId) {
            return __awaiter(this, void 0, void 0, function* () {
                if (receiverId === -1) //globalchat
                 {
                    let chatSession = yield prisma.chatSession.findFirst({ where: { account1Id: 1, account2Id: 1 } });
                    if (!chatSession)
                        chatSession = yield prisma.chatSession.create({ data: { account1Id: 1, account2Id: 1 } });
                    return chatSession;
                }
                let chatSession = yield prisma.chatSession.findFirst({
                    where: {
                        OR: [
                            { account1Id: senderId, account2Id: receiverId },
                            { account1Id: receiverId, account2Id: senderId },
                        ]
                    }
                });
                if (!chatSession) {
                    chatSession = yield prisma.chatSession.create({ data: { account1Id: senderId, account2Id: receiverId } });
                }
                return chatSession;
            });
        }
        function notifyClients(newMessage) {
            return __awaiter(this, void 0, void 0, function* () {
                const { chatSessionId } = newMessage;
                const activeChatSockets = activeChats.get(chatSessionId);
                // console.log(`Notifying all clients connected to ChatSessionId ${chatSessionId}`);
                if (activeChatSockets) {
                    activeChatSockets.forEach(socket => {
                        if (socket.readyState === ws_1.default.OPEN) {
                            socket.send(JSON.stringify(newMessage));
                            console.log("client notified");
                        }
                    });
                }
            });
        }
    });
}

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
            const { senderId, receiverId } = request.query;
            const senderIdNum = parseInt(senderId);
            const receiverIdNum = parseInt(receiverId);
<<<<<<< HEAD
            let chatSession;
            if (receiverIdNum === -1) {
                chatSession = yield prisma.chatSession.findFirst({
                    where: {
                        account1Id: 1,
                        account2Id: 1
=======
            //get chatSessionId from api
            let chatSession = yield prisma.chatSession.findFirst({
                where: {
                    OR: [
                        { account1Id: senderIdNum, account2Id: receiverIdNum },
                        { account1Id: receiverIdNum, account2Id: senderIdNum }
                    ]
                }
            });
            //create chatsession if not exist
            if (!chatSession) {
                chatSession = yield prisma.chatSession.create({
                    data: {
                        account1Id: senderIdNum,
                        account2Id: receiverIdNum
>>>>>>> live_chat_jim
                    }
                });
                if (!chatSession) {
                    chatSession = yield prisma.chatSession.create({
                        data: {
                            account1Id: 1,
                            account2Id: 1
                        }
                    });
                }
            }
            else {
                chatSession = yield prisma.chatSession.findFirst({
                    where: {
                        OR: [
                            { account1Id: senderIdNum, account2Id: receiverIdNum },
                            { account1Id: receiverIdNum, account2Id: senderIdNum }
                        ]
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
            }
<<<<<<< HEAD
=======
            //get all messages from chatSessionId + username of sender(for display)
>>>>>>> live_chat_jim
            const messages = yield prisma.message.findMany({
                where: { chatSessionId: chatSession.id },
                orderBy: { timestamp: 'asc' },
                include: {
                    sender: {
                        select: {
                            username: true,
                        }
                    }
                }
            });
            // transform the messages for sending response
            const transformedMessages = messages.map(message => ({
                content: message.content,
                timestamp: message.timestamp,
                senderUsername: message.sender.username,
                chatSessionId: message.chatSessionId
            }));
            return (reply.send({ success: true, messages: transformedMessages, chatSessionId: chatSession.id }));
        }));
        function notifyClients(newMessage) {
            return __awaiter(this, void 0, void 0, function* () {
                const { chatSessionId } = newMessage;
                console.log(`Notifying all clients connected to ChatSessionId ${chatSessionId}`);
                const activeChatSockets = activeChats.get(chatSessionId);
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
        server.post('/api/send-message', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { senderId, receiverId, content } = request.body;
            const sender = yield prisma.account.findUnique({ where: { id: senderId } });
            const receiver = yield prisma.account.findUnique({ where: { id: receiverId } });
            if (!sender || (!receiver && receiverId !== -1))
                return reply.status(400).send({ error: 'Api/sendMessage:Invalid_sender/receiver' });
<<<<<<< HEAD
            let chatSession;
            if (receiverId === -1) {
                chatSession = yield prisma.chatSession.findFirst({
                    where: {
                        account1Id: 1,
                        account2Id: 1
=======
            let chatSession = yield prisma.chatSession.findFirst({
                where: {
                    OR: [{ account1Id: senderId, account2Id: receiverId },
                        { account1Id: receiverId, account2Id: senderId }]
                }
            });
            // should be unneccecairy 
            if (!chatSession) {
                chatSession = yield prisma.chatSession.create({
                    data: {
                        account1Id: senderId,
                        account2Id: receiverId
>>>>>>> live_chat_jim
                    }
                });
                if (!chatSession) {
                    chatSession = yield prisma.chatSession.create({
                        data: {
                            account1Id: 1,
                            account2Id: 1
                        }
                    });
                }
            }
            else {
                chatSession = yield prisma.chatSession.findFirst({
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
            }
            const message = yield prisma.message.create({
                data: {
                    content,
                    senderId: (receiverId === -1 ? 1 : senderId),
                    receiverId: (receiverId === -1 ? 1 : receiverId),
                    chatSessionId: chatSession.id
                },
                include: {
                    sender: {
                        select: {
                            username: true
                        }
                    }
                }
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
    });
}

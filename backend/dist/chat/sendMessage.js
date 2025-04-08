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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sendMessage;
const getOrCreateChatSession_1 = require("./chatUtils/getOrCreateChatSession");
const createWebsocket_1 = require("./createWebsocket");
function sendMessage(server, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        server.post('/api/send-message', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { senderId, receiverId, content, status } = request.body;
            const chatSession = yield (0, getOrCreateChatSession_1.getOrCreateChatSession)(senderId, receiverId);
            const message = yield prisma.message.create({
                data: {
                    content,
                    senderId: senderId,
                    receiverId: (receiverId === -1 ? 1 : receiverId),
                    chatSessionId: chatSession.id,
                    status: status,
                },
                include: { sender: { select: { username: true } } }
            });
            const messageToClient = {
                id: message.id,
                content: message.content,
                timestamp: message.timestamp,
                senderUsername: message.sender.username,
                chatSessionId: message.chatSessionId,
                status: message.status
            };
            (0, createWebsocket_1.notifyClients)(messageToClient);
            return reply.send({ success: true, messageToClient });
        }));
    });
}

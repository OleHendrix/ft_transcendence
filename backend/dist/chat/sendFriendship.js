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
exports.default = sendFriendship;
const getOrCreateChatSession_1 = require("./chatUtils/getOrCreateChatSession");
const createWebsocket_1 = require("./createWebsocket");
function sendFriendship(server, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        server.post('/api/update-friendship', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { senderId, receiverId, status, messageId } = request.body;
            try {
                if (!messageId) {
                    console.error("❌ Error: messageId is missing!");
                    return reply.status(400).send({ error: "messageId is required" });
                }
                const friendship = yield prisma.friendship.findFirst({
                    where: { OR: [
                            { requesterId: senderId, receiverId: receiverId }, { requesterId: receiverId, receiverId: senderId }
                        ]
                    }
                });
                if (friendship && !friendship.accepted) {
                    if (status === 3 || status === 4)
                        yield prisma.friendship.delete({ where: { id: friendship.id } });
                    else
                        yield prisma.friendship.update({ where: { id: friendship.id }, data: { accepted: true } });
                }
                const chatSession = yield (0, getOrCreateChatSession_1.getOrCreateChatSession)(senderId, receiverId);
                const update = yield prisma.message.update({
                    where: {
                        chatSessionId: chatSession.id,
                        id: messageId,
                    },
                    data: { status: status }
                });
                yield prisma.message.deleteMany({
                    where: {
                        chatSessionId: chatSession.id,
                        content: "::friendRequest::",
                        NOT: { id: messageId }
                    }
                });
                (0, createWebsocket_1.notifyClients)(update);
                reply.send({ success: true, message: "Message status updated successfully." });
            }
            catch (error) {
                console.error("Error updating message status:", error);
                reply.status(500).send({ success: false, error: "Failed to update message status." });
            }
        }));
        server.post('/api/send-friendship', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { requesterId, receiverId } = request.body;
            const friendship = yield prisma.friendship.findFirst({
                where: { OR: [
                        { requesterId: requesterId, receiverId: receiverId }, { requesterId: receiverId, receiverId: requesterId }
                    ]
                }
            });
            if (!friendship) {
                yield prisma.friendship.create({
                    data: {
                        requesterId: requesterId,
                        receiverId: receiverId
                    }
                });
            }
            const chatSession = yield (0, getOrCreateChatSession_1.getOrCreateChatSession)(requesterId, receiverId);
            const message = yield prisma.message.create({
                data: {
                    content: '::friendRequest::',
                    senderId: requesterId,
                    receiverId: receiverId,
                    chatSessionId: chatSession.id,
                    status: 1,
                },
                include: { sender: { select: { username: true } } }
            });
            return reply.send({ success: true });
        }));
    });
}

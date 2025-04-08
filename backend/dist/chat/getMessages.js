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
exports.default = getMessages;
// chat/chat.ts (or wherever needed)
const getOrCreateChatSession_1 = require("./chatUtils/getOrCreateChatSession");
const getBlockedUserIds_1 = require("./chatUtils/getBlockedUserIds");
function getMessages(server, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        server.get("/api/get-messages", (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { senderId, receiverId } = request.query;
                const senderIdNum = parseInt(senderId);
                const receiverIdNum = parseInt(receiverId);
                const chatSession = yield (0, getOrCreateChatSession_1.getOrCreateChatSession)(senderIdNum, receiverIdNum);
                const blockedUserIds = yield (0, getBlockedUserIds_1.getBlockedUserIds)(senderIdNum);
                const messages = yield prisma.message.findMany({
                    where: {
                        chatSessionId: chatSession.id,
                        senderId: { notIn: blockedUserIds }
                    },
                    orderBy: { timestamp: 'asc' },
                    include: {
                        sender: {
                            select: { username: true }
                        }
                    }
                });
                const transformedMessages = messages.map(({ id, content, timestamp, sender, senderId, chatSessionId, status }) => ({
                    id,
                    content,
                    timestamp,
                    senderUsername: sender.username,
                    senderId,
                    chatSessionId,
                    status
                }));
                reply.send({ success: true, messages: transformedMessages, chatSessionId: chatSession.id });
            }
            catch (error) {
                console.error("Error in /api/get-messages:", error);
                reply.status(500).send({ success: false, error: "Internal Server Error" });
            }
        }));
    });
}

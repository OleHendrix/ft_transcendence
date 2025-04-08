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
exports.default = setMsgStatus;
const getOrCreateChatSession_1 = require("./chatUtils/getOrCreateChatSession");
const createWebsocket_1 = require("./createWebsocket");
function setMsgStatus(server, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        server.post('/api/change-msg-status', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { senderId, receiverId, status, messageId } = request.body;
                if (!messageId) {
                    console.error("❌ Error: messageId is missing!");
                    return reply.status(400).send({ error: "messageId is required" });
                }
                const chatSession = yield (0, getOrCreateChatSession_1.getOrCreateChatSession)(senderId, receiverId);
                const update = yield prisma.message.update({
                    where: {
                        chatSessionId: chatSession.id,
                        id: messageId,
                    },
                    data: {
                        status: status,
                    },
                });
                (0, createWebsocket_1.notifyClients)(update);
                reply.send({ success: true, message: "Message status updated successfully." });
            }
            catch (error) {
                console.error("Error updating message status:", error);
                reply.status(500).send({ success: false, error: "Failed to update message status." });
            }
        }));
    });
}

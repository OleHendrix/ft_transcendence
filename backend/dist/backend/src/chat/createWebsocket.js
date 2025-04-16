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
exports.default = createWebsocket;
exports.notifyClients = notifyClients;
const getOrCreateChatSession_1 = require("./chatUtils/getOrCreateChatSession");
const ws_1 = __importDefault(require("ws"));
const activeChats = new Map();
function createWebsocket(server, prisma) {
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
        server.post('/api/send-istyping', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { senderId, receiverId } = request.body;
            const chatSession = yield (0, getOrCreateChatSession_1.getOrCreateChatSession)(senderId, receiverId);
            const activeChatSockets = activeChats.get(chatSession.id);
            const user = yield prisma.account.findUnique({ where: { id: senderId } });
            if (activeChatSockets) {
                activeChatSockets.forEach(socket => {
                    if (socket.readyState === ws_1.default.OPEN) {
                        socket.send(JSON.stringify({ isTyping: user === null || user === void 0 ? void 0 : user.username }));
                        return reply.send({ success: true });
                    }
                });
            }
            reply.status(404).send({ success: false, error: "Failed to send isTyping notification" });
        }));
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

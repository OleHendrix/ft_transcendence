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
exports.getOrCreateChatSession = getOrCreateChatSession;
// utils/chatSession.ts
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function getOrCreateChatSession(senderId, receiverId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (receiverId === -1) {
            let chatSession = yield prisma.chatSession.findFirst({
                where: { account1Id: 1, account2Id: 1 }
            });
            if (!chatSession) {
                chatSession = yield prisma.chatSession.create({
                    data: { account1Id: 1, account2Id: 1 }
                });
            }
            return chatSession;
        }
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
                data: { account1Id: senderId, account2Id: receiverId }
            });
        }
        return chatSession;
    });
}

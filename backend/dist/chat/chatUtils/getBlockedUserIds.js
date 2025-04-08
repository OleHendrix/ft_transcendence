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
exports.getBlockedUserIds = getBlockedUserIds;
// utils/chatSession.ts
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function getBlockedUserIds(senderId) {
    return __awaiter(this, void 0, void 0, function* () {
        const senderBlocks = yield prisma.account.findUnique({
            where: { id: senderId },
            include: {
                Blocks: {
                    select: {
                        blockedId: true
                    }
                }
            }
        });
        const blockedUserIds = (senderBlocks === null || senderBlocks === void 0 ? void 0 : senderBlocks.Blocks.map(b => b.blockedId)) || [];
        return (blockedUserIds);
    });
}

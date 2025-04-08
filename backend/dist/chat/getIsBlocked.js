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
exports.default = getIsBlocked;
function getIsBlocked(server, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        server.get('/api/is-blocked', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { senderId, receiverId } = request.query;
                const senderIdNum = parseInt(senderId, 10);
                const receiverIdNum = parseInt(receiverId, 10);
                const isBlocked = yield prisma.block.findFirst({
                    where: {
                        OR: [
                            { blockerId: receiverIdNum, blockedId: senderIdNum },
                            { blockerId: senderIdNum, blockedId: receiverIdNum }
                        ]
                    }
                });
                if (isBlocked) {
                    // Determine who is the blocker
                    const amIBlocker = isBlocked.blockerId === senderIdNum;
                    return reply.send({
                        success: true,
                        blocked: true,
                        amIBlocker
                    });
                }
                return reply.send({ success: true, blocked: false });
            }
            catch (error) {
                console.error("Error checking block status:", error);
                reply.status(500).send({ success: false, error: "Internal server error" });
            }
        }));
    });
}

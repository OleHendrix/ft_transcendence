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
exports.default = blockUser;
const createWebsocket_1 = require("./createWebsocket");
function blockUser(server, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        server.post('/api/block-user', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { senderId, receiverId } = request.body;
            if (receiverId === -1)
                return;
            let block = yield prisma.block.findFirst({
                where: {
                    blockerId: senderId,
                    blockedId: receiverId
                }
            });
            if (!block) {
                block = yield prisma.block.create({
                    data: {
                        blockerId: senderId,
                        blockedId: receiverId,
                    }
                });
            }
            (0, createWebsocket_1.notifyClients)(block);
            return reply.send({ succes: true });
        }));
    });
}

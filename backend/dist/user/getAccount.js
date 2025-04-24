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
exports.default = getAccount;
function getAccount(fastify, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.get('/api/get-account', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { requestedUser, username } = request.query;
            const requestedUserId = parseInt(requestedUser);
            let user = yield prisma.account.findUnique({
                where: {
                    username
                },
                include: {
                    matches: true,
                }
            });
            let friendshipStatus = false;
            if (requestedUser !== username) {
                const friendship = yield prisma.friendship.findFirst({
                    where: {
                        OR: [{ requesterId: requestedUserId, receiverId: user === null || user === void 0 ? void 0 : user.id }, { requesterId: user === null || user === void 0 ? void 0 : user.id, receiverId: requestedUserId }]
                    }
                });
                if (friendship)
                    friendshipStatus = friendship.accepted;
            }
            if (user) {
                if (user.avatar && user.avatar !== '')
                    user.avatar = `http://${request.hostname}:5001${user.avatar}`;
                reply.send({ success: true, user, friendshipStatus });
            }
            else
                reply.status(404).send({ success: false, error: "Error in fetching account" });
        }));
    });
}

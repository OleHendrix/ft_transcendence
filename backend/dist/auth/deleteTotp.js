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
exports.default = deleteTotp;
function deleteTotp(fastify, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/auth/delete-totp', {
            preHandler: fastify.authenticate
        }, (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const userId = request.account.sub;
            const account = yield prisma.account.findUnique({ where: { id: userId } });
            if (!account || !account.totpSecret)
                return reply.status(404).send({ error: 'User not found or 2fa not enabled' });
            const updatedAccount = yield prisma.account.update({
                where: { id: userId },
                data: {
                    totpSecret: null,
                    twofa: false
                }
            });
            return reply.send({ success: true, account: updatedAccount });
        }));
    });
}

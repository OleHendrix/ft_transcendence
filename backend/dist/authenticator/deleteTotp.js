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
        fastify.post('/api/auth/delete-totp', (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { username } = req.body;
            const account = yield prisma.account.findUnique({ where: { username } });
            if (!account)
                return reply.status(404).send({ error: 'User not found' });
            yield prisma.account.update({
                where: { username },
                data: { totpSecret: null }
            });
            return reply.send({ message: '2FA Disabled' });
        }));
    });
}

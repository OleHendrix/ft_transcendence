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
exports.default = deleteAccount;
function deleteAccount(fastify, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/delete-account', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { username } = request.body;
            // console.log(username);
            try {
                const deleted = yield prisma.account.delete({ where: { username } });
                console.log(deleted);
                return reply.send({ success: true });
            }
            catch (error) {
                return reply.status(500).send({ error: 'Account deletion failed' });
            }
        }));
    });
}

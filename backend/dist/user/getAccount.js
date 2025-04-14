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
            const { accountId } = request.query;
            const accountIdNum = Number(accountId);
            const user = yield prisma.account.findUnique({ where: { id: accountIdNum } });
            if (user) {
                reply.send({ success: true, user });
            }
            else
                reply.status(404).send({ success: false, error: "Error in fetching account" });
        }));
    });
}

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
exports.default = checkValidation;
function checkValidation(fastify, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/check-validation', (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { username, email } = req.body;
            const usernameExist = yield prisma.account.findUnique({ where: { username } });
            if (usernameExist !== null)
                return reply.status(200).send({ success: false, type: 'Username exists' });
            const emailExist = yield prisma.account.findUnique({ where: { email } });
            if (emailExist !== null)
                return reply.status(200).send({ success: false, type: 'Email exists' });
            return reply.status(200).send({ success: true });
        }));
    });
}

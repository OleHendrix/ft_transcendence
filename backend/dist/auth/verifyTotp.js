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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = verifyTotp;
const speakeasy_1 = __importDefault(require("speakeasy"));
function verifyTotp(fastify, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/auth/verify-login-totp', (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { token: totpToken, jwt: tempJwt } = req.body;
            try {
                const decoded = fastify.jwt.verify(tempJwt);
                const userId = decoded.sub;
                const account = yield prisma.account.findUnique({ where: { id: userId } });
                if (!account || !account.totpSecret)
                    return reply.code(400).send({ success: false, message: 'Totp not setup' });
                const isValid = speakeasy_1.default.totp.verify({
                    secret: account.totpSecret,
                    encoding: 'base32',
                    token: totpToken,
                    window: 1,
                });
                if (!isValid)
                    return reply.code(401).send({ success: false, message: 'Verkeerde token gek' });
                yield prisma.account.update({
                    where: { id: userId },
                    data: { online: true },
                });
                const finalToken = fastify.jwt.sign({
                    sub: account.id,
                    username: account.username,
                    email: account.email,
                    twofaEnabled: true,
                }, { expiresIn: '1h' });
                return reply.send({ success: true, token: finalToken, user: account });
            }
            catch (err) {
                reply.code(401).send({ message: 'Unauthorized' });
            }
        }));
    });
}

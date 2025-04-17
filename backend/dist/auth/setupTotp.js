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
exports.default = setupTotp;
exports.verifySetupTotp = verifySetupTotp;
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
function setupTotp(fastify, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/auth/setup-totp', (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { username } = req.body;
            console.log('username:', username);
            const account = yield prisma.account.findUnique({ where: { username } });
            if (!account)
                return reply.code(404).send({ message: 'User not found' });
            const secret = speakeasy_1.default.generateSecret({ name: `NextBall [${username}]` });
            yield prisma.account.update({
                where: { username },
                data: { totpSecret: secret.base32 }
            });
            const qrCodeUrl = yield qrcode_1.default.toDataURL(secret.otpauth_url || '', {
                color: {
                    dark: '#FFFFFF',
                    light: '#ff914d'
                }
            });
            return reply.send({ qrCodeUrl });
        }));
    });
}
function verifySetupTotp(fastify, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/auth/verify-setup-totp', { preValidation: [fastify.authenticate] }, (request, reply) => __awaiter(this, void 0, void 0, function* () {
            yield request.jwtVerify();
            const userId = request.account.sub;
            const { token: totpToken } = request.body;
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
                data: { twofaEnabled: true },
            });
            return reply.send({ success: true, message: '2fa enabled ouweeee' });
        }));
    });
}

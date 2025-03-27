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
            const secret = speakeasy_1.default.generateSecret({ name: `NextBall (${username})` });
            yield prisma.account.update({
                where: { username },
                data: { totpSecret: secret.base32 }
            });
            const qrCodeUrl = yield qrcode_1.default.toDataURL(secret.otpauth_url || '');
            return reply.send({ qrCodeUrl });
        }));
    });
}

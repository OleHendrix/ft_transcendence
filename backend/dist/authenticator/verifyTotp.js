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
const server_1 = __importDefault(require("../server"));
function verifyTotp(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/auth/verify-totp', (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { username, token } = req.body;
            const account = yield server_1.default.account.findUnique({ where: { username } });
            if (!account || !account.totpSecret)
                return reply.code(400).send({ success: false, message: 'TOTP is not setup' });
            const isValid = speakeasy_1.default.totp.verify({
                secret: account.totpSecret,
                encoding: 'base32',
                token,
                window: 1,
            });
            if (!isValid)
                return reply.code(401).send({ success: false, message: 'Verkeerde token gek' });
            return { success: true };
        }));
    });
}

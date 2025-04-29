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
exports.default = login;
const bcrypt_1 = __importDefault(require("bcrypt"));
function login(fastify, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/login', (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { username, password } = req.body;
            const account = yield prisma.account.findUnique({ where: { username } });
            if (!account)
                return reply.status(400).send({ error: 'Username not found' });
            const validPassword = yield bcrypt_1.default.compare(password, account.password);
            if (!validPassword)
                return reply.status(401).send({ error: 'Password incorrect' });
            if (account.online)
                reply.status(402).send({ error: 'Already logged in' });
            if (account.twofa) {
                console.log('needs 2fa');
                const tempToken = fastify.jwt.sign({
                    sub: account.id,
                    username: account.username,
                    email: account.email,
                    twofaRequired: true,
                }, { expiresIn: '5m' });
                return reply.send({ success: false, token: tempToken, twofaRequired: true });
            }
            yield prisma.account.update({
                where: { username },
                data: { online: true }
            });
            if (account.avatar && account.avatar !== '')
                account.avatar = `http://${req.hostname}:5001${account.avatar}`;
            const finalToken = fastify.jwt.sign({
                sub: account.id,
                username: account.username,
                email: account.email,
                twofaRequired: true,
            }, { expiresIn: '1h' });
            reply.send({ success: true, token: finalToken, account });
        }));
    });
}

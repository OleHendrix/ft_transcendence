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
        fastify.post('/api/login', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { username, password } = req.body;
            const user = yield prisma.account.findUnique({ where: { username } });
            if (!user)
                return res.status(400).send({ error: 'Username not found' });
            const validPassword = yield bcrypt_1.default.compare(password, user.password);
            if (!validPassword)
                return res.status(401).send({ error: 'Password incorrect' });
            if (user.online)
                res.status(402).send({ error: 'Already logged in' });
            yield prisma.account.update({
                where: { username },
                data: { online: true }
            });
            const token = fastify.jwt.sign({ username: user.username, email: user.email }, { expiresIn: '1h' });
            res.send({ success: true, token, user });
        }));
    });
}

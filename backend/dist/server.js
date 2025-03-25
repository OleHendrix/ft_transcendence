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
const fastify_1 = __importDefault(require("fastify"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("@fastify/cors"));
const fastify_jwt_1 = __importDefault(require("fastify-jwt"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const setupTotp_1 = __importDefault(require("./authenticator/setupTotp"));
const verifyTotp_1 = __importDefault(require("./authenticator/verifyTotp"));
const chat_1 = require("./chat");
// import dotenv from 'dotenv';
const fastify = (0, fastify_1.default)();
const prisma = new client_1.PrismaClient();
fastify.register(cors_1.default);
fastify.register(fastify_jwt_1.default, { secret: process.env.SECRET_KEY || "balzak" });
(0, chat_1.setupChat)(fastify);
fastify.get('/', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    return { message: 'Server is running!' };
}));
fastify.post('/api/addaccount', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = request.body;
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const existingAccount = yield prisma.account.findFirst({
        where: {
            OR: [{ username: username }, { email: email }]
        }
    });
    if (existingAccount) {
        if (existingAccount.username === username)
            return reply.status(400).send({ error: 'Username already exists' });
        if (existingAccount.email === email)
            return reply.status(400).send({ error: 'Email already exists' });
    }
    const newAccount = yield prisma.account.create({
        data: {
            username: username,
            email: email,
            password: hashedPassword,
            wins: 0,
            draws: 0,
            loses: 0
        }
    });
    return reply.send({ success: true, account: newAccount });
}));
fastify.post("/api/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = yield prisma.account.findUnique({ where: { username } });
    if (!user)
        return res.status(400).send({ eror: "User not found" });
    const validPassword = yield bcrypt_1.default.compare(password, user.password);
    if (!validPassword)
        return res.status(401).send({ error: "Incorrect password" });
    const token = fastify.jwt.sign({ username: user.username, email: user.email }, { expiresIn: "1h" });
    res.send({ success: true, token, user });
}));
fastify.get('/api/getplayers', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const players = yield prisma.account.findMany();
        return reply.send({ success: true, players });
    }
    catch (error) {
        return reply.status(500).send({ error: 'Error getting players from database' });
    }
}));
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, setupTotp_1.default)(fastify);
    yield (0, verifyTotp_1.default)(fastify);
    fastify.listen({ port: 5001, host: 'localhost' }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server running at ${address}`);
    });
});
start();
exports.default = prisma;

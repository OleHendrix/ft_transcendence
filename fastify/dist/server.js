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
// Initialize Fastify
const fastify = (0, fastify_1.default)();
// Enable CORS
fastify.register(cors_1.default);
// Initialize Prisma Client
const prisma = new client_1.PrismaClient();
// Root endpoint
fastify.get('/', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    return { message: 'Server is running!' };
}));
fastify.post('/api/addaccount', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = request.body;
    const existingAccount = yield prisma.account.findFirst({
        where: {
            OR: [
                { username: username },
                { email: email }
            ]
        }
    });
    if (existingAccount) {
        if (existingAccount.username === username) {
            return reply.status(400).send({ error: 'Username already exists' });
        }
        else if (existingAccount.email === email) {
            return reply.status(400).send({ error: 'Email already exists' });
        }
    }
    const newAccount = yield prisma.account.create({
        data: {
            username: username,
            email: email,
            password: password,
            wins: 0,
            draws: 0,
            loses: 0
        }
    });
    return reply.send({ success: true, account: newAccount });
}));
// GET endpoint to get all players
fastify.get('/api/getplayers', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const players = yield prisma.account.findMany();
        return reply.send({ success: true, players });
    }
    catch (error) {
        return reply.status(500).send({ error: 'Error getting players from database' });
    }
}));
// Start the Fastify server
fastify.listen({ port: 5001, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server running at ${address}`);
});

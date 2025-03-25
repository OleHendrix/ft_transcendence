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
const PongServer_1 = require("./PongServer");
const console_1 = require("console");
// import dotenv from 'dotenv';
// import { PongState } from './../../frontend/src/types'
const fastify = (0, fastify_1.default)();
fastify.register(cors_1.default);
fastify.register(fastify_jwt_1.default, { secret: process.env.SECRET_KEY || "balzak" });
const prisma = new client_1.PrismaClient();
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
fastify.listen({ port: 5001, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server running at ${address}`);
});
;
let userTable = {};
// gets userID's match and sends it's inputs
// TODO: add input
fastify.post('/pong', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID, keysPressed } = request.body;
    if (userID === undefined) {
        console.log("User undefined");
        reply.status(400);
        return;
    }
    console.log("Detected user:", userID);
    if ((userID in userTable) === false) {
        console.log("User not in table");
        reply.status(400);
        return;
    }
    let state;
    try {
        state = (0, PongServer_1.getGame)(userTable[userID].ID);
    }
    catch (error) {
        console.log("Caught error:", error);
        reply.status(400);
        return;
    }
    console.log(state);
    reply.status(200).send(state);
}));
// adds a new match between userID1 and userID2
fastify.post('/pong/add', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID1, userID2 } = request.body;
    console.log("adding game with:", userID1, userID2);
    if (userID1 === undefined || userID2 === undefined) {
        console.log("User undefined");
        reply.status(400);
        return;
    }
    if ((userID1 in userTable) || (userID1 in userTable)) {
        console.log("User already in table");
        reply.status(400);
        return;
    }
    let matchID = (0, PongServer_1.postGame)();
    userTable[userID1] = { ID: matchID, isPlayer1: true, isAI: false };
    userTable[userID2] = { ID: matchID, isPlayer1: false, isAI: userID2 === -1 };
    reply.status(201);
}));
// deletes the match userID1 is in
fastify.post('/pong/delete', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID1, userID2 } = request.body;
    if (userID1 === undefined || userID2 === undefined) {
        console.log("User undefined");
        reply.status(400);
        return;
    }
    try {
        const ID = userTable[userID1].ID;
        delete userTable[userID1];
        delete userTable[userID2]; // fine because delete userTable[-1] throws no error
        (0, PongServer_1.deleteGame)(ID);
    }
    catch (_a) {
        console.log("Caught error:", console_1.error);
        reply.status(404);
        return;
    }
    reply.status(200);
}));

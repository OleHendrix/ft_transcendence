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
const setupTotp_1 = __importDefault(require("./authenticator/setupTotp"));
const verifyTotp_1 = __importDefault(require("./authenticator/verifyTotp"));
const deleteTotp_1 = __importDefault(require("./authenticator/deleteTotp"));
const addAccount_1 = __importDefault(require("./usermanagement/addAccount"));
const deleteAccount_1 = __importDefault(require("./usermanagement/deleteAccount"));
const getPlayers_1 = __importDefault(require("./usermanagement/getPlayers"));
const login_1 = __importDefault(require("./usermanagement/login"));
const fastify = (0, fastify_1.default)();
fastify.register(cors_1.default);
fastify.register(fastify_jwt_1.default, { secret: process.env.SECRET_KEY || "balzak" });
const prisma = new client_1.PrismaClient();
fastify.get('/', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    return { message: 'Server is running!' };
}));
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, addAccount_1.default)(fastify, prisma);
    yield (0, deleteAccount_1.default)(fastify, prisma);
    yield (0, getPlayers_1.default)(fastify, prisma);
    yield (0, login_1.default)(fastify, prisma);
    yield (0, setupTotp_1.default)(fastify, prisma);
    yield (0, verifyTotp_1.default)(fastify, prisma);
    yield (0, deleteTotp_1.default)(fastify, prisma);
    fastify.listen({ port: 5001, host: 'localhost' }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server running at ${address}`);
    });
});
start();

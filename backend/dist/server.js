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
exports.prisma = void 0;
const fastify_1 = __importDefault(require("fastify"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const cors_1 = __importDefault(require("@fastify/cors"));
const client_1 = require("@prisma/client");
const websocket_1 = __importDefault(require("@fastify/websocket"));
const setupTotp_1 = __importDefault(require("./auth/setupTotp"));
const verifyTotp_1 = __importDefault(require("./auth/verifyTotp"));
const deleteTotp_1 = __importDefault(require("./auth/deleteTotp"));
const addAccount_1 = __importDefault(require("./user/addAccount"));
const deleteAccount_1 = __importDefault(require("./user/deleteAccount"));
const getAccounts_1 = __importDefault(require("./user/getAccounts"));
const getAccount_1 = __importDefault(require("./user/getAccount"));
const checkValidation_1 = __importDefault(require("./user/checkValidation"));
const login_1 = __importDefault(require("./user/login"));
const logout_1 = __importDefault(require("./user/logout"));
const updateAccount_1 = __importDefault(require("./user/updateAccount"));
const pongServer_1 = __importDefault(require("./pong/pongServer"));
const matchMaking_1 = __importDefault(require("./pong/matchMaking"));
const chat_1 = require("./chat/chat");
const tournament_1 = require("./tournament/tournament");
const authenticate_1 = __importDefault(require("./auth/authenticate"));
const verifySetupTotp_1 = __importDefault(require("./auth/verifySetupTotp"));
const fastify = (0, fastify_1.default)();
exports.prisma = new client_1.PrismaClient();
fastify.register(cors_1.default);
fastify.register(jwt_1.default, { secret: process.env.SECRET_KEY || "balzak" });
fastify.register(websocket_1.default, { options: { clientTracking: true } });
fastify.register(authenticate_1.default);
(0, chat_1.setupChat)(fastify, exports.prisma);
(0, tournament_1.setupTournament)(fastify);
fastify.get('/', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    return { message: 'Server is running!' };
}));
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, addAccount_1.default)(fastify, exports.prisma);
    yield (0, deleteAccount_1.default)(fastify, exports.prisma);
    yield (0, getAccounts_1.default)(fastify, exports.prisma);
    yield (0, getAccount_1.default)(fastify, exports.prisma);
    yield (0, checkValidation_1.default)(fastify, exports.prisma);
    yield (0, login_1.default)(fastify, exports.prisma);
    yield (0, logout_1.default)(fastify, exports.prisma);
    yield (0, updateAccount_1.default)(fastify, exports.prisma);
    yield (0, setupTotp_1.default)(fastify, exports.prisma);
    yield (0, verifySetupTotp_1.default)(fastify, exports.prisma);
    yield (0, verifyTotp_1.default)(fastify, exports.prisma);
    yield (0, deleteTotp_1.default)(fastify, exports.prisma);
    yield (0, pongServer_1.default)(fastify);
    (0, matchMaking_1.default)(fastify);
    fastify.listen({ port: 5001, host: '0.0.0.0' }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server running at ${address}`);
    });
});
start();

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
exports.setupChat = setupChat;
const blockUser_1 = __importDefault(require("./blockUser"));
const createWebsocket_1 = __importDefault(require("./createWebsocket"));
const getIsBlocked_1 = __importDefault(require("./getIsBlocked"));
const getMessages_1 = __importDefault(require("./getMessages"));
const sendMessage_1 = __importDefault(require("./sendMessage"));
const sendFriendship_1 = __importDefault(require("./sendFriendship"));
const setMsgStatus_1 = __importDefault(require("./setMsgStatus"));
const unblockUser_1 = __importDefault(require("./unblockUser"));
function setupChat(fastify, prisma) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, blockUser_1.default)(fastify, prisma);
        yield (0, createWebsocket_1.default)(fastify, prisma);
        yield (0, getIsBlocked_1.default)(fastify, prisma);
        yield (0, getMessages_1.default)(fastify, prisma);
        yield (0, sendMessage_1.default)(fastify, prisma);
        yield (0, sendFriendship_1.default)(fastify, prisma);
        yield (0, setMsgStatus_1.default)(fastify, prisma);
        yield (0, unblockUser_1.default)(fastify, prisma);
    });
}

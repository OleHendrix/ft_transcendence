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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = initInvite;
const pongServer_1 = require("./pongServer");
class BiMap {
    constructor() {
        this.forward = new Map();
        this.reverse = new Map();
    }
    set(key, value) {
        this.forward.set(key, value);
        this.reverse.set(value, key);
    }
    getByKey(key) { return this.forward.get(key); }
    getByValue(value) { return this.reverse.get(value); }
    deleteByKey(key) {
        const value = this.forward.get(key);
        if (value !== undefined) {
            this.forward.delete(key);
            this.reverse.delete(value);
        }
    }
    deleteByValue(value) {
        const key = this.reverse.get(value);
        if (key !== undefined) {
            this.reverse.delete(value);
            this.forward.delete(key);
        }
    }
    hasKey(key) { return this.forward.has(key); }
    hasValue(value) { return this.reverse.has(value); }
    size() { return this.forward.size; }
}
const invites = new BiMap(); // msgID <-> WebSocket
const senders = new Map(); // msgID --> sender's userID
function findSocket(msgID) {
    if (msgID === undefined)
        return undefined;
    return invites.getByKey(msgID);
}
function deleteByMsgID(msgID) {
    if (msgID === undefined)
        return;
    invites.deleteByKey(msgID);
    senders.delete(msgID);
}
function deleteBySocket(socket) {
    if (socket === undefined)
        return;
    const msgID = invites.getByValue(socket);
    invites.deleteByValue(socket);
    if (msgID)
        senders.delete(msgID);
}
function initInvite(fastify) {
    fastify.post('/invite/accept', (request, reply) => __awaiter(this, void 0, void 0, function* () {
        const { msgID, user } = request.body;
        const socket = findSocket(msgID);
        if (socket === undefined)
            return reply.code(500).send(false);
        // TODO: check if sender is available
        if ((0, pongServer_1.isInGame)(senders.get(msgID)) === true) {
            return reply.code(200).send(false);
        }
        socket.send(JSON.stringify(user));
        deleteByMsgID(msgID);
        return reply.code(200).send(true);
    }));
    fastify.post('/invite/decline', (request, reply) => __awaiter(this, void 0, void 0, function* () {
        const { msgID } = request.body;
        const socket = findSocket(msgID);
        if (socket === undefined)
            return reply.code(500).send(false);
        socket.close();
        deleteByMsgID(msgID);
        return reply.code(200).send(true);
    }));
    fastify.post('/invite/cancel', (request, reply) => __awaiter(this, void 0, void 0, function* () {
        const { msgID } = request.body;
        if (msgID === undefined)
            return reply.code(500).send(false);
        deleteByMsgID(msgID);
        return reply.code(200).send(true);
    }));
    fastify.register(function (fastify) {
        return __awaiter(this, void 0, void 0, function* () {
            fastify.get("/invite/send", { websocket: true }, (connection, req) => {
                connection.on("message", (message) => {
                    const data = JSON.parse(message.toString());
                    const [msgID, senderID] = [data.ID, data.senderID];
                    if (msgID === undefined)
                        return;
                    invites.set(msgID, connection);
                    senders.set(msgID, senderID);
                });
                connection.on("close", () => {
                    deleteBySocket(connection);
                });
            });
        });
    });
}

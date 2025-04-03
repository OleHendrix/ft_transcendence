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
exports.default = initMatchMaking;
const pongServer_1 = require("./pongServer");
const types_1 = require("./types");
const queue = new Map();
function matchMake(socket1, user1, socket2, user2) {
    (0, pongServer_1.addGame)(user1.player, user2.player, false);
    socket1.send("Starting match");
    socket2.send("Starting match");
    console.log("Starting match");
}
function findMatch(socket, user) {
    for (const [key, value] of queue) {
        if (value.opponentID === types_1.Opponent.ANY || value.opponentID === user.player.id &&
            user.opponentID === types_1.Opponent.ANY || user.opponentID === value.player.id) {
            queue.delete(key);
            matchMake(key, value, socket, user);
            return true;
        }
    }
    ;
    return false;
}
function matchVsAI(socket, user) {
    (0, pongServer_1.addGame)(user.player, { id: -1, username: "AI" }, true);
    socket.send("Starting match");
}
function initMatchMaking(fastify) {
    fastify.register(function (fastify) {
        return __awaiter(this, void 0, void 0, function* () {
            fastify.get("/matchmake", { websocket: true }, (connection, req) => {
                connection.on("message", (message) => {
                    const user = JSON.parse(message.toString());
                    if (user.opponentID == types_1.Opponent.AI) {
                        matchVsAI(connection, user);
                    }
                    else if (findMatch(connection, user) === false) {
                        queue.set(connection, user);
                    }
                });
                connection.on("close", () => {
                    queue.delete(connection);
                });
            });
        });
    });
}

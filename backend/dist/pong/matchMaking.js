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
const queue = new Map();
function matchMake() {
    const match = Array.from(queue).slice(0, 2);
    const [socket1, user1] = match[0];
    const [socket2, user2] = match[1];
    (0, pongServer_1.addGame)(user1, user2, false);
    socket1.send("Starting match");
    socket2.send("Starting match");
    queue.delete(socket1);
    queue.delete(socket2);
}
function initMatchMaking(fastify) {
    fastify.register(function (fastify) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("init MM server");
            fastify.get("/matchmake", { websocket: true }, (connection, req) => {
                console.log("Player connected");
                connection.on("message", (message) => {
                    console.log("Got input");
                    const user = JSON.parse(message.toString());
                    queue.set(connection, user);
                    if (queue.size >= 2)
                        matchMake();
                });
                connection.on("close", () => {
                    console.log("Player disconnected");
                    queue.delete(connection);
                });
            });
        });
    });
}

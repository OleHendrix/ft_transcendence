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
exports.addGame = addGame;
exports.default = initPongServer;
const pongLogic_1 = require("./pongLogic");
const types_1 = require("./types");
let matchTable = new Map([]);
let matchIDTable = new Map([]);
function addGame(user1, user2, isLocalGame, tournament) {
    let newMatch = {
        state: (0, pongLogic_1.initGame)(user1, user2),
        p1: user1,
        p2: user2,
        isLocalGame: isLocalGame,
        tournament: tournament
    };
    let key = 0;
    while (matchTable.has(key)) {
        key++;
    }
    matchTable.set(key, newMatch);
    matchIDTable.set(user1.id, key);
    if (user2.id !== -1)
        matchIDTable.set(user2.id, key);
}
function initPongServer(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.register(function (fastify) {
            return __awaiter(this, void 0, void 0, function* () {
                fastify.get("/pong", { websocket: true }, (connection, req) => {
                    connection.on("message", (message) => {
                        const { userID, keysPressed } = JSON.parse(message.toString());
                        if (userID === undefined || keysPressed === undefined) {
                            console.log("Undefined input:", userID, keysPressed);
                            connection.send(400);
                            return;
                        }
                        if (matchIDTable.has(userID) === false) {
                            connection.send(400);
                            return;
                        }
                        const key = matchIDTable.get(userID);
                        if (matchTable.has(key) === false) {
                            connection.send(400);
                            return;
                        }
                        let match = matchTable.get(key);
                        (0, pongLogic_1.updateGame)(match, userID, keysPressed);
                        if (match.isLocalGame === false && userID === match.p2.id)
                            connection.send(JSON.stringify((0, pongLogic_1.mirrorGame)(match.state)));
                        else
                            connection.send(JSON.stringify(match.state));
                    });
                });
            });
        });
        // adds a new match between userID1 and userID2
        fastify.post('/pong/add', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { user1, user2, isLocalGame, tournament } = request.body;
            if (user1 === undefined || user2 === undefined || isLocalGame === undefined || tournament === undefined) {
                reply.status(400);
                return;
            }
            addGame(user1, user2, isLocalGame, tournament);
            reply.status(201);
        }));
        fastify.post('/pong/is-local', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { userID } = request.body;
            if (userID === undefined) {
                reply.status(204).send(false);
                return;
            }
            if (matchIDTable.has(userID) === false) {
                reply.status(204).send(false);
                return;
            }
            const key = matchIDTable.get(userID);
            if (matchTable.has(key) === false) {
                reply.status(204).send(false);
                return;
            }
            const match = matchTable.get(key);
            reply.status(200).send(match.isLocalGame);
        }));
        fastify.post('/pong/end-game', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { userID } = request.body;
            if (userID === undefined) {
                reply.status(204);
                return;
            }
            if (matchIDTable.has(userID) === false) {
                reply.status(204);
                return;
            }
            const key = matchIDTable.get(userID);
            if (matchTable.has(key) === false) {
                reply.status(204);
                return;
            }
            const match = matchTable.get(key);
            (0, pongLogic_1.endGame)(match, match.p1.id !== userID ? types_1.Result.P1WON : types_1.Result.P2WON);
            reply.status(200);
        }));
        fastify.post('/pong/delete', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { userID } = request.body;
            if (userID === undefined) {
                reply.status(204);
                return;
            }
            if (matchIDTable.has(userID) === false) {
                reply.status(204);
                return;
            }
            const key = matchIDTable.get(userID);
            if (matchTable.has(key) === false) {
                reply.status(204);
                return;
            }
            const match = matchTable.get(key);
            if (match.isLocalGame === true) {
                matchIDTable.delete(match.p1.id);
                matchIDTable.delete(match.p2.id);
            }
            else {
                matchIDTable.delete(userID);
            }
            if (matchIDTable.has(match.p1.id) === false && matchIDTable.has(match.p2.id) === false) {
                matchTable.delete(key);
            }
            reply.status(200);
        }));
    });
}

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
// import { markAsUncloneable } from 'worker_threads';
const pongLogic_1 = require("./pongLogic");
const types_1 = require("../types/types");
// import { match } from 'assert';
let matchTable = new Map([]);
let matchIDTable = new Map([]);
function getMatch(userID) {
    // console.log("\n-----------------\n>>> GET MATCH <<<\n-----------------");
    if (userID === undefined) {
        console.log(">>> UID is undefined");
        return null;
    }
    if (matchIDTable.has(userID) === false) {
        console.log(">>> cannot find UID in MID table:", matchIDTable);
        return null;
    }
    const key = matchIDTable.get(userID);
    if (matchTable.has(key) === false) {
        console.log(">>> cannot find MID in match table:", matchTable);
        return null;
    }
    return matchTable.get(key);
}
function addGame(user1, user2, isLocalGame, tournamentId, tournament) {
    let newMatch = {
        state: (0, pongLogic_1.initGame)(user1, user2),
        p1: user1,
        p2: user2,
        isLocalGame: isLocalGame,
        tournamentId: tournamentId,
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
                        const match = getMatch(userID);
                        if (match === null) {
                            connection.send(400);
                            return;
                        }
                        (0, pongLogic_1.updateGame)(match, userID, keysPressed);
                        if (match.isLocalGame === false && userID === match.p2.id)
                            connection.send(JSON.stringify((0, pongLogic_1.mirrorGame)(match)));
                        else
                            connection.send(JSON.stringify(match));
                    });
                });
            });
        });
        // adds a new match between userID1 and userID2
        fastify.post('/pong/add', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { user1, user2, isLocalGame, tournamentId } = request.body;
            if (user1 === undefined || user2 === undefined || isLocalGame === undefined || tournamentId === undefined) {
                reply.status(400);
                return;
            }
            addGame(user1, user2, isLocalGame, tournamentId);
            reply.status(201);
        }));
        fastify.post('/pong/is-local', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { userID } = request.body;
            const match = getMatch(userID);
            if (match === null) {
                reply.status(200).send(false);
                return;
            }
            reply.status(200).send(match.isLocalGame);
        }));
        fastify.post('/pong/end-game', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { userID } = request.body;
            console.log("--- ending match with UID:", userID);
            const match = getMatch(userID);
            if (match === null) {
                reply.status(404);
                return;
            }
            const result = match.isLocalGame === true
                ? types_1.Result.DRAW
                : match.p1.id === userID
                    ? types_1.Result.P2WON
                    : types_1.Result.P1WON;
            (0, pongLogic_1.endGame)(match, result);
            reply.status(200);
        }));
        fastify.post('/pong/delete', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { userID } = request.body;
            console.log("--- deleting match with UID:", userID);
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
                console;
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

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
let matchTable = new Map([]);
let matchIDTable = new Map([]);
function addGame(userID1, userID2, isLocalGame) {
    let newMatch = {
        state: (0, pongLogic_1.initGame)(),
        p1: userID1,
        p2: userID2,
        isLocalGame: isLocalGame,
    };
    let key = 0;
    while (matchTable.has(key)) {
        key++;
    }
    matchTable.set(key, newMatch);
    matchIDTable.set(userID1, key);
    if (userID2 !== -1)
        matchIDTable.set(userID2, key);
}
function initPongServer(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        // gets userID's match and sends it's inputs
        fastify.post('/pong', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { userID, keysPressed } = request.body;
            if (userID === undefined || keysPressed === undefined) {
                console.log("Undefined input:", userID, keysPressed);
                reply.status(400);
                return;
            }
            if (matchIDTable.has(userID) === false) {
                reply.status(400);
                return;
            }
            const key = matchIDTable.get(userID);
            if (matchTable.has(key) === false) {
                reply.status(400);
                return;
            }
            let match = matchTable.get(key);
            (0, pongLogic_1.updateGame)(match, userID, keysPressed);
            reply.status(200).send(match.state);
        }));
        // adds a new match between userID1 and userID2
        fastify.post('/pong/add', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { userID1, userID2, isLocalGame } = request.body;
            if (userID1 === undefined || userID2 === undefined || isLocalGame === undefined) {
                reply.status(400);
                return;
            }
            addGame(userID1, userID2, isLocalGame);
            reply.status(201);
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
            (0, pongLogic_1.endGame)(match, match.p1 !== userID);
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
                matchIDTable.delete(match.p1);
                matchIDTable.delete(match.p2);
            }
            else {
                matchIDTable.delete(userID);
            }
            if (matchIDTable.has(match.p1) === false && matchIDTable.has(match.p2) === false) {
                matchTable.delete(key);
            }
            reply.status(200);
        }));
    });
}

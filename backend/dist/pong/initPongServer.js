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
exports.default = initPongServer;
const PongServer_1 = require("./PongServer");
let userTable = new Map([]);
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
            if (userTable.has(userID) === false) {
                reply.status(400);
                return;
            }
            let state;
            try {
                state = (0, PongServer_1.getGame)(userTable.get(userID), keysPressed);
            }
            catch (error) {
                reply.status(400);
                return;
            }
            reply.status(200).send(state);
        }));
        // adds a new match between userID1 and userID2
        fastify.post('/pong/add', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { userID1, userID2 } = request.body;
            if (userID1 === undefined || userID2 === undefined) {
                reply.status(400);
                return;
            }
            if (userTable.has(userID1) && (userID2 === -1 || userTable.has(userID2))) {
                reply.status(200);
                return;
            }
            let matchID = (0, PongServer_1.postGame)();
            userTable.set(userID1, { ID: matchID, isPlayer1: true, vsAI: userID2 === -1 });
            userTable.set(userID2, { ID: matchID, isPlayer1: false, vsAI: false });
            reply.status(201);
        }));
        // deletes the match userID1 is in
        fastify.post('/pong/delete', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { userID1, userID2 } = request.body;
            if (userID1 === undefined || userID2 === undefined) {
                reply.status(400);
                return;
            }
            try {
                const ID = (_a = userTable.get(userID1)) === null || _a === void 0 ? void 0 : _a.ID; // shits the bed if userTable doenst contain userID1
                userTable.delete(userID1);
                userTable.delete(userID2); // fine because delete userTable[-1] throws no error
                (0, PongServer_1.deleteGame)(ID);
            }
            catch (_b) {
                reply.status(404);
                return;
            }
            reply.status(200);
        }));
    });
}

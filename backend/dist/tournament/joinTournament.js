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
exports.joinTournament = joinTournament;
const handleJoinTournament_1 = require("./handleJoinTournament");
function joinTournament(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.register(function (fastify) {
            return __awaiter(this, void 0, void 0, function* () {
                fastify.get('/ws/join-tournament', { websocket: true }, (connection, req) => {
                    try {
                        // console.log(req.query);
                        const { playerId, playerUsername, tournamentId } = req.query;
                        (0, handleJoinTournament_1.handleJoinTournament)(connection, Number(playerId), playerUsername, Number(tournamentId));
                    }
                    catch (error) {
                        console.log(error);
                    }
                });
            });
        });
    });
}

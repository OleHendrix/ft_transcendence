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
exports.getTournamentLobbies = getTournamentLobbies;
const tournament_1 = require("./tournament");
function getTournamentLobbies(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.get('/api/get-tournament-lobbies', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const lobbySummaries = Array.from(tournament_1.tournamentLobbies.entries()).map(([tournamentId, lobby]) => {
                var _a;
                return ({
                    tournamentId,
                    hostUsername: ((_a = lobby.players[0]) === null || _a === void 0 ? void 0 : _a.username) || 'Unknown',
                    currentPlayers: lobby.players.length,
                    maxPlayers: lobby.maxPlayers,
                });
            });
            reply.send(lobbySummaries);
        }));
    });
}

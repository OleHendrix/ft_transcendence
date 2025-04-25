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
exports.leaveTournament = leaveTournament;
const tournament_1 = require("./tournament");
const broadcastTournamentUpdates_1 = require("./broadcastTournamentUpdates");
function leaveTournament(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/leave-tournament', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { playerId, tournamentId } = request.body;
            let tournament = tournament_1.tournamentLobbies.get(tournamentId);
            if (!tournament)
                return reply.status(500).send({ error: `player ${playerId} tried to leave invalid tournamentid: ${tournamentId}` });
            //Host leaves close everything 
            if (playerId === tournament.hostId) {
                for (let socket of tournament.sockets) {
                    socket.close();
                    tournament.sockets.delete(socket);
                }
                tournament_1.tournamentLobbies.delete(tournamentId);
                return;
            }
            for (let socket of tournament.sockets) {
                if (socket.playerId === playerId) {
                    socket.close();
                    tournament.sockets.delete(socket);
                }
            }
            tournament.players = tournament.players.filter(player => player.id !== playerId);
            if (tournament.players.length === 0)
                tournament_1.tournamentLobbies.delete(tournamentId);
            (0, broadcastTournamentUpdates_1.broadcastTournamentUpdate)(tournamentId, "UPDATE");
        }));
    });
}

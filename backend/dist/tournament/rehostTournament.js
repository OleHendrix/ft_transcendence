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
exports.rehostTournament = rehostTournament;
const tournament_1 = require("./tournament");
const broadcastTournamentUpdates_1 = require("./broadcastTournamentUpdates");
function rehostTournament(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post(`/api/rehost-tournament`, (request, reply) => {
            try {
                const { tournamentId } = request.body;
                const tournament = tournament_1.tournamentLobbies.get(tournamentId);
                if (!tournament)
                    return reply.status(500).send(`rehost-tournament:ERROR:invalid_tournamentId:${tournamentId}`);
                if (tournament.players.length < 2)
                    return reply.status(500).send(`rehost-tournament:ERROR:rehosting_tournamentId"${tournamentId}:NOT_ENOUGH_PLAYERS_TO_REHOST`);
                if (!tournament.players[1].id || !tournament.players[1].username)
                    return console.log(`rehost-tournament:ERROR:corrupted_player_in_tournament:id:${tournament.players[1].id}`);
                tournament.hostId = tournament.players[1].id;
                tournament.hostUsername = tournament.players[1].username;
                (0, broadcastTournamentUpdates_1.broadcastTournamentUpdate)(tournamentId, "UPDATE");
                return reply.status(200).send({ message: "Rehost successful" });
            }
            catch (error) {
                console.log(error);
                return reply.status(500).send({ error: "Internal Server Error" });
            }
        });
    });
}

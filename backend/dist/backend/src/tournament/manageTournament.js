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
exports.manageTournament = manageTournament;
const tournament_1 = require("./tournament");
const types_1 = require("../types/types");
const broadcastTournamentUpdates_1 = require("./broadcastTournamentUpdates");
const pongServer_1 = require("../pong/pongServer");
const setRounds_1 = require("./setRounds");
function manageTournament(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/start-tournament', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { tournamentId } = request.body;
            console.log("start ALDSKFLKJDFLKLF", tournamentId);
            const lobby = tournament_1.tournamentLobbies.get(tournamentId);
            if (!lobby)
                return reply.status(404).send({ error: 'Tournament not found' });
            if (!lobby.rounds)
                (0, setRounds_1.setRounds)(tournamentId);
            if (!lobby.rounds)
                return;
            for (const round of lobby.rounds) {
                (0, pongServer_1.addGame)(round.p1, round.p2, false, tournamentId);
            }
            return reply.send({ succes: true });
        }));
        fastify.post('/api/start-next-round', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { tournamentId } = request.body;
            const lobby = tournament_1.tournamentLobbies.get(tournamentId);
            if (!lobby)
                return reply.status(404).send({ error: 'Tournament not found' });
            if (!lobby.rounds)
                return reply.status(500).send({ error: 'NO ROUNDS' });
            if (allRoundsFinished(lobby.rounds)) {
                let winners = [];
                for (const round of lobby.rounds) {
                    winners.push(round.result === types_1.Result.P1WON ? round.p1 : round.p2);
                }
                lobby.players = winners;
                lobby.rounds = [];
                if (lobby.players.length === 1) {
                    tournament_1.tournamentLobbies.delete(tournamentId);
                    (0, broadcastTournamentUpdates_1.broadcastTournamentUpdate)(tournamentId, "WINNER_WINNER_CHICKEN_DINNER");
                    return reply.send({ winner: (_a = lobby.players.pop()) === null || _a === void 0 ? void 0 : _a.username });
                }
                (0, setRounds_1.setRounds)(tournamentId);
                (0, broadcastTournamentUpdates_1.broadcastTournamentUpdate)(tournamentId, "PLAYER_UPDATE");
                for (const round of lobby.rounds) {
                    (0, pongServer_1.addGame)(round.p1, round.p2, false, tournamentId);
                }
                return reply.send({ roundFinished: true });
            }
            (0, broadcastTournamentUpdates_1.broadcastTournamentUpdate)(tournamentId, "RESULT_UPDATE");
            return reply.send({ roundFinished: false, message: 'Waiting for more results' });
        }));
    });
}
function allRoundsFinished(rounds) {
    for (const round of rounds) {
        if (round.result === types_1.Result.PLAYING)
            return false;
    }
    return true;
}

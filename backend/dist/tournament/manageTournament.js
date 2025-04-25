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
const setMatches_1 = require("./setMatches");
function manageTournament(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/start-tournament', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { tournamentId } = request.body;
            const tournament = tournament_1.tournamentLobbies.get(tournamentId);
            if (!tournament)
                return reply.status(404).send({ error: 'Tournament not found' });
            if (!tournament.rounds)
                tournament.rounds = [];
            tournament.rounds[0] = [];
            (0, setMatches_1.setMatches)(tournament);
            if (!tournament.rounds)
                return reply.status(401).send({ succes: false, error: "Failed to set matches" });
            for (const match of tournament.rounds[0]) {
                (0, pongServer_1.addGame)(match.p1, match.p2, false, tournamentId);
            }
            (0, broadcastTournamentUpdates_1.broadcastTournamentUpdate)(tournamentId, "START_SIGNAL");
            return reply.send({ succes: true });
        }));
        //everytime a game finishes this is called
        fastify.post('/api/start-next-round', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { tournamentId } = request.body;
            const t = tournament_1.tournamentLobbies.get(tournamentId);
            if (!t)
                return reply.status(404).send({ error: 'Tournament not found' });
            if (!t.rounds)
                return reply.status(500).send({ error: 'NO ROUNDS' });
            if (allMatchesFinished(t)) {
                console.log(`manageTournaments:allMatchesFinished:RoundIdx${t.roundIdx}`);
                t.winners[t.roundIdx] = [];
                for (const match of t.rounds[t.roundIdx]) {
                    t.winners[t.roundIdx].push(match.state.result === types_1.Result.P1WON ? match.p1 : match.p2);
                }
                t.roundIdx++;
                t.rounds[t.roundIdx] = [];
                if (t.players.length === 1) {
                    tournament_1.tournamentLobbies.delete(tournamentId);
                    (0, broadcastTournamentUpdates_1.broadcastTournamentUpdate)(tournamentId, "UPDATE");
                    return reply.send({ winner: (_a = t.players.pop()) === null || _a === void 0 ? void 0 : _a.username });
                }
                (0, setMatches_1.setMatches)(t);
                for (const match of t.rounds[t.roundIdx]) {
                    (0, pongServer_1.addGame)(match.p1, match.p2, false, tournamentId);
                }
                (0, broadcastTournamentUpdates_1.broadcastTournamentUpdate)(tournamentId, "UPDATE");
                return reply.send({ roundFinished: true });
            }
            return reply.send({ roundFinished: false, message: 'Waiting for more results' });
        }));
    });
}
function allMatchesFinished(t) {
    if (!t.rounds)
        return;
    for (const round of t.rounds[t.roundIdx]) {
        if (round.state.result === types_1.Result.PLAYING)
            return false;
    }
    return true;
}

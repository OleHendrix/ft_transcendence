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
exports.createTournament = createTournament;
exports.joinTournament = joinTournament;
exports.manageTournaments = manageTournaments;
exports.getTournamentLobbies = getTournamentLobbies;
const types_1 = require("./types");
let tournamentLobbies = new Map();
function createTournament(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/create-tournament', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { host, maxPlayers } = request.body;
            let key;
            for (key = 0; tournamentLobbies.has(key); key++)
                ;
            let tournamentData = { players: [host], maxPlayers: maxPlayers, rounds: null };
            tournamentLobbies.set(key, tournamentData);
            return reply.send({ tournamentId: key });
        }));
    });
}
function joinTournament(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/join-tournament', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { player, tournamentId } = request.body;
            let lobby = tournamentLobbies.get(tournamentId);
            if (!lobby)
                return reply.status(404).send({ error: 'Tournament not found' });
            if (lobby.players.length >= lobby.maxPlayers)
                return reply.send({ error: 'Tournament already full' });
            lobby.players.push(player);
            if (lobby.players.length == lobby.maxPlayers) {
                setRounds(tournamentId);
                return reply.send({ start: true, rounds: lobby.rounds });
            }
            return reply.send({ message: 'Joined the tournament succesfully!' });
        }));
    });
}
function manageTournaments(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/tournament', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            for (const [id, lobby] of tournamentLobbies) {
                if (!lobby.rounds)
                    continue;
                let allFinished = true;
                for (const round of lobby.rounds) {
                    if (round.result === types_1.Result.PLAYING)
                        allFinished = false;
                    continue;
                }
                if (allFinished) {
                    let winners = [];
                    for (const round of lobby.rounds) {
                        winners.push(round.result === types_1.Result.P1WON ? round.p1 : round.p2);
                    }
                    lobby.players = winners;
                    lobby.rounds = [];
                    for (let i = 0; i < winners.length; i += 2) {
                        lobby.rounds.push({
                            p1: winners[i],
                            p2: winners[i + 1],
                            result: types_1.Result.PLAYING,
                        });
                    }
                }
            }
        }));
    });
}
function getTournamentLobbies(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.get('/api/get-tournament-lobbies', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            for (const lobby of tournamentLobbies) {
            }
        }));
    });
}
function setRounds(tournamentId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        let lobby = tournamentLobbies.get(tournamentId);
        if (!lobby)
            return null;
        if (!lobby.rounds)
            lobby.rounds = [];
        for (let i = 0; i < lobby.players.length; i += 2) {
            (_a = lobby.rounds) === null || _a === void 0 ? void 0 : _a.push({
                p1: lobby.players[i],
                p2: lobby.players[i + 1],
                result: types_1.Result.PLAYING
            });
        }
    });
}

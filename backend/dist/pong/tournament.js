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
exports.leaveTournament = leaveTournament;
exports.manageTournaments = manageTournaments;
exports.getTournamentById = getTournamentById;
exports.getTournamentLobbies = getTournamentLobbies;
exports.setResults = setResults;
const types_1 = require("./types");
require("ws");
let tournamentLobbies = new Map();
function createTournament(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.register(function (fastify) {
            return __awaiter(this, void 0, void 0, function* () {
                fastify.get('/ws/create-tournament', { websocket: true }, (connection, req) => {
                    const { hostId, hostUsername, maxPlayers } = req.query;
                    let tournamentId = 1;
                    while (tournamentLobbies.has(tournamentId))
                        tournamentId++;
                    connection.playerId = Number(hostId);
                    const sockets = new Set();
                    sockets.add(connection);
                    const tournamentData = {
                        players: [{ id: Number(hostId), username: hostUsername }],
                        maxPlayers: Number(maxPlayers),
                        rounds: null,
                        sockets: new Set([connection])
                    };
                    tournamentLobbies.set(tournamentId, tournamentData);
                    connection.send(JSON.stringify({ tournamentId }));
                    connection.on("close", () => {
                        console.log(`Tournament ${tournamentId} creator disconnected`);
                    });
                });
            });
        });
    });
}
function broadcastTournamentUpdate(tournamentId, updatedData) {
    console.log(`broadcasting: ${JSON.stringify(updatedData)} to:`, tournamentId);
    let tournament = tournamentLobbies.get(tournamentId);
    if (!tournament)
        return;
    tournament.sockets.forEach(socket => {
        socket.send(JSON.stringify({
            type: "TOURNAMENT_UPDATE",
            tournament: updatedData,
        }));
    });
}
function joinTournament(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.register(function (fastify) {
            return __awaiter(this, void 0, void 0, function* () {
                fastify.get('/ws/join-tournament', { websocket: true }, (connection, req) => {
                    const { playerId, playerUsername, tournamentId } = req.query;
                    let tournament = tournamentLobbies.get(Number(tournamentId));
                    if (!tournament)
                        return console.log("Tournament not found");
                    if (tournament.players.length >= tournament.maxPlayers)
                        return console.log("Tournament already full");
                    const parsedPlayer = {
                        id: Number(playerId),
                        username: playerUsername,
                    };
                    connection.playerId = Number(playerId);
                    tournament.players.push(parsedPlayer);
                    tournament.sockets.add(connection);
                    broadcastTournamentUpdate(Number(tournamentId), tournament);
                    connection.on("close", () => {
                        console.log(`Tournament: ${tournamentId} player: ${parsedPlayer.id} disconnected`);
                    });
                });
            });
        });
    });
}
function leaveTournament(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/leave-tournament', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const { playerId, tournamentId } = request.body;
            console.log(`player ${playerId} leaving tournament ${tournamentId}`);
            let tournament = tournamentLobbies.get(tournamentId);
            if (!tournament)
                return reply.status(400).send({ error: "Invalid tournament ID" });
            for (let socket of tournament.sockets) {
                if (socket.playerId = playerId) {
                    console.log(`player ${playerId} left tournament lobby ${tournamentId}`);
                    socket.close();
                    tournament.sockets.delete(socket);
                }
            }
            tournament.players = tournament.players.filter(player => player.id !== playerId);
            if (tournament.players.length === 0) {
                console.log(`tournamentId ${tournamentId} empty. deleting`);
                tournamentLobbies.delete(tournamentId);
            }
            broadcastTournamentUpdate(tournamentId, tournament);
        }));
    });
}
function manageTournaments(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/api/tournament', (request, reply) => // rename
         __awaiter(this, void 0, void 0, function* () {
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
                            p1score: 0,
                            p2score: 0,
                            result: types_1.Result.PLAYING,
                        });
                    }
                }
            }
        }));
    });
}
function getTournamentById(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.get('/api/get-tournament/:id', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id } = request.params;
            const tournamentId = parseInt(id, 10);
            if (isNaN(tournamentId)) {
                return reply.status(400).send({ error: "Invalid tournament ID" });
            }
            const tournament = tournamentLobbies.get(tournamentId);
            if (!tournament) {
                return reply.status(404).send({ error: "Tournament not found" });
            }
            const tournamentInfo = {
                tournamentId,
                hostUsername: ((_a = tournament.players[0]) === null || _a === void 0 ? void 0 : _a.username) || "Unknown",
                players: tournament.players.map(player => player.username),
                maxPlayers: tournament.maxPlayers,
                currentPlayers: tournament.players.length,
                roundsStarted: tournament.rounds !== null,
            };
            reply.send(tournamentInfo);
        }));
    });
}
function getTournamentLobbies(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.get('/api/get-tournament-lobbies', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const lobbySummaries = Array.from(tournamentLobbies.entries()).map(([tournamentId, lobby]) => {
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
function setRounds(tournamentId) {
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
            p1score: 0,
            p2score: 0,
            result: types_1.Result.PLAYING
        });
    }
}
function setResults(tournamentId, p1, p1score, p2score, result) {
    var _a;
    let lobby = tournamentLobbies.get(tournamentId);
    if (!lobby)
        return;
    let round = (_a = lobby.rounds) === null || _a === void 0 ? void 0 : _a.find(round => round.p1.id === p1);
    if (!round)
        return;
    round.p1score = p1score;
    round.p2score = p2score;
    round.result = result;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastTournamentUpdate = broadcastTournamentUpdate;
const tournament_1 = require("./tournament");
const ws_1 = require("ws");
function broadcastTournamentUpdate(tournamentId, type) {
    const tournament = tournament_1.tournamentLobbies.get(tournamentId);
    if (!tournament)
        return;
    let payload;
    if (type === "UPDATE") {
        payload =
            {
                type,
                tournament: {
                    tournamentId: tournament.tournamentId,
                    hostId: tournament.hostId,
                    hostUsername: tournament.hostUsername,
                    maxPlayers: tournament.maxPlayers,
                    players: tournament.players,
                    winners: tournament.winners,
                    roundIdx: tournament.roundIdx,
                    rounds: tournament.rounds
                }
            };
    }
    else if (type === "START_SIGNAL") {
        payload = {
            type,
            data: {
                start: true,
            }
        };
    }
    else {
        console.warn("Unknown broadcast type:", type);
        return;
    }
    const message = JSON.stringify(payload);
    tournament.sockets.forEach(socket => {
        if (socket.readyState === ws_1.WebSocket.OPEN) {
            socket.send(message);
        }
    });
}

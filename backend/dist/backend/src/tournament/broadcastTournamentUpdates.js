"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastTournamentUpdate = broadcastTournamentUpdate;
const tournament_1 = require("./tournament");
const ws_1 = require("ws");
function broadcastTournamentUpdate(tournamentId, updateType) {
    const tournament = tournament_1.tournamentLobbies.get(tournamentId);
    if (!tournament)
        return;
    let payload;
    if (updateType === "PLAYER_UPDATE") {
        payload = {
            type: updateType,
            tournament: {
                tournamentId: tournament.tournamentId,
                hostUsername: tournament.hostUsername,
                maxPlayers: tournament.maxPlayers,
                players: tournament.players.map(p => p.username),
            },
        };
    }
    if (updateType === "START_SIGNAL") {
        payload = {
            type: updateType,
            data: {
                start: true,
            }
        };
    }
    if (updateType === "RESULT_UPDATE") {
        payload = {
            type: updateType,
            tournament: {
                tournamentId: tournament.tournamentId,
                hostUsername: tournament.hostUsername,
                maxPlayers: tournament.maxPlayers,
                players: tournament.players.map(p => p.username),
                rounds: tournament.rounds
            },
        };
    }
    if (updateType === "WINNER_WINNER_CHICKEN_DINNER") {
        payload = {
            type: updateType,
            data: {
                winner: true,
            }
        };
    }
    const message = JSON.stringify(payload);
    console.log(`broadcast ${message}`);
    tournament.sockets.forEach(socket => {
        if (socket.readyState === ws_1.WebSocket.OPEN) {
            socket.send(message);
        }
    });
}

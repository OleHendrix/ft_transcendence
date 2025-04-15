"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastTournamentUpdate = broadcastTournamentUpdate;
const tournament_1 = require("./tournament");
const ws_1 = require("ws");
function broadcastTournamentUpdate(tournamentId) {
    const tournament = tournament_1.tournamentLobbies.get(tournamentId);
    if (!tournament)
        return;
    const payload = {
        type: "TOURNAMENT_UPDATE",
        tournament: {
            tournamentId: tournament.tournamentId,
            hostUsername: tournament.hostUsername,
            maxPlayers: tournament.maxPlayers,
            players: tournament.players.map(p => p.username),
        },
    };
    console.log(`broadcast ${JSON.stringify(tournament.players)}`);
    const message = JSON.stringify(payload);
    tournament.sockets.forEach(socket => {
        if (socket.readyState === ws_1.WebSocket.OPEN) {
            socket.send(message);
        }
    });
}

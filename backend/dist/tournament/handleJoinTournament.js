"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleJoinTournament = handleJoinTournament;
const tournament_1 = require("./tournament");
const broadcastTournamentUpdates_1 = require("./broadcastTournamentUpdates");
function handleJoinTournament(connection, playerId, playerUsername, tournamentId) {
    const tournament = tournament_1.tournamentLobbies.get(tournamentId);
    if (!tournament) {
        console.log(`Tournament ${tournamentId} not found`);
        connection.close();
        return;
    }
    if (tournament.players.length >= tournament.maxPlayers) {
        console.log(`Tournament ${tournamentId} already full`);
        connection.close();
        return;
    }
    if (tournament.players.find(p => p.id === playerId)) {
        console.log(`Player ${playerId} already in tournament`);
        return;
    }
    const player = {
        id: playerId,
        username: playerUsername,
    };
    connection.playerId = playerId;
    tournament.players.push(player);
    tournament.sockets.add(connection);
    (0, broadcastTournamentUpdates_1.broadcastTournamentUpdate)(tournamentId, "PLAYER_UPDATE");
    connection.on("close", () => {
        tournament.players = tournament.players.filter(p => p.id !== playerId);
        tournament.sockets.delete(connection);
        (0, broadcastTournamentUpdates_1.broadcastTournamentUpdate)(tournamentId, "PLAYER_UPDATE");
    });
}

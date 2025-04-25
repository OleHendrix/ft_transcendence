"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleJoinTournament = handleJoinTournament;
const tournament_1 = require("./tournament");
const broadcastTournamentUpdates_1 = require("./broadcastTournamentUpdates");
function handleJoinTournament(connection, playerId, playerUsername, tournamentId) {
    if (tournamentId === -1)
        return;
    const tournament = tournament_1.tournamentLobbies.get(tournamentId);
    if (!tournament) {
        console.log(`handleJoinTournament:Tournament:${tournamentId}:ERROR_NOT_FOUND`);
        connection.close();
        return;
    }
    if (tournament.players.length >= tournament.maxPlayers) {
        console.log(`handleJoinTournament:Tournament:${tournamentId}:ERROR_TOURNAMENT_FULL`); //TODO test this
        connection.close();
        return;
    }
    if (tournament.players.find(p => p.id === playerId))
        return console.log(`handleJoinTournament:Player${playerId}:TRIED_TO_JOIN:tournament${tournamentId}:ALLREADY_IN`);
    const player = {
        id: playerId,
        username: playerUsername,
    };
    connection.playerId = playerId; // useless??? 
    tournament.players.push(player);
    tournament.sockets.add(connection);
    (0, broadcastTournamentUpdates_1.broadcastTournamentUpdate)(tournamentId, "UPDATE");
    // connection.on("close", () => { //DONT PUT THIS SHIT HERE??? its in context 
    // 	tournament.players = tournament.players.filter(p => p.id !== playerId);
    // 	tournament.sockets.delete(connection);
    // 	broadcastTournamentUpdate(tournamentId, "UPDATE");
    // });
}

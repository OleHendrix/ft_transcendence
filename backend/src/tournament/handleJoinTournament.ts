import { tournamentLobbies } 			from "./tournament";
import { PlayerData } 					from "../types/types";
import { broadcastTournamentUpdate } 	from "./broadcastTournamentUpdates";
import type { WebSocket } 				from 'ws';

declare module 'ws' {
	interface WebSocket {
		playerId?: number;
	}
}

export function handleJoinTournament(connection: WebSocket, playerId: number, playerUsername: string, tournamentId: number): void 
{
	if (tournamentId === -1) return ;

	const tournament = tournamentLobbies.get(tournamentId);
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

	const player: PlayerData = {
		id: playerId,
		username: playerUsername,
	};

	connection.playerId = playerId; // useless??? 

	tournament.players.push(player);
	tournament.sockets.add(connection);
  
	broadcastTournamentUpdate(tournamentId, "UPDATE");

	// connection.on("close", () => { //DONT PUT THIS SHIT HERE??? its in context 
	// 	tournament.players = tournament.players.filter(p => p.id !== playerId);
	// 	tournament.sockets.delete(connection);
	// 	broadcastTournamentUpdate(tournamentId, "UPDATE");
	// });
}
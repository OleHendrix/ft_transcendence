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
  
	if (tournament.players.find(p => p.id === playerId)){
		tournament.sockets.add(connection);
		return console.log(`handleJoinTournament:Player${playerId}:TRIED_TO_JOIN:tournament${tournamentId}:ALLREADY_IN`);
	}

	const player: PlayerData = {
		id: playerId,
		username: playerUsername,
	};

	connection.playerId = playerId;

	tournament.players.push(player);
	tournament.sockets.add(connection);

	connection.on("close", () => {
		console.log(`Cleaning up closed socket for player ${connection.playerId}`);
		tournament.sockets.delete(connection);
	});

	broadcastTournamentUpdate(tournamentId, "DATA");
}
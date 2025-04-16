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
	const tournament = tournamentLobbies.get(tournamentId);
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

	const player: PlayerData = {
		id: playerId,
		username: playerUsername,
	};

	connection.playerId = playerId;

	tournament.players.push(player);
	tournament.sockets.add(connection);
  
	broadcastTournamentUpdate(tournamentId, "PLAYER_UPDATE");
	if (tournament.players.length >= tournament.maxPlayers){
		broadcastTournamentUpdate(tournamentId, "START_SIGNAL");
	}
  
	connection.on("close", () => {
		tournament.players = tournament.players.filter(p => p.id !== playerId);
		tournament.sockets.delete(connection);
		console.log("ON CLOSE PLAYERUPDATE");
		broadcastTournamentUpdate(tournamentId, "PLAYER_UPDATE");
	});
}
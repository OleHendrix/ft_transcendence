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
	if (!tournament)
	{
		console.log(`handleJoinTournament:Tournament:${tournamentId}:ERROR_NOT_FOUND`);
		connection.close();
		throw ("shitsbriccky");
	}

	if (tournament.players.find(p => p.id === playerId))
	{
		// Verwijder oude socket van dezelfde speler als die bestaat
		for (let socket of tournament.sockets)
		{
			if (socket.playerId === playerId)
				return ;
		}
		// Voeg nieuwe socket toe
		tournament.sockets.add(connection);
		connection.playerId = playerId;
		console.log(`handleJoinTournament:Player${playerId}:REJOINED:tournament${tournamentId}`);
		broadcastTournamentUpdate(tournamentId, "DATA");
		return;
	}
	if (tournament.players.length >= tournament.maxPlayers) {
		console.log(`handleJoinTournament:Tournament:${tournamentId}:ERROR_TOURNAMENT_FULL`); //TODO test this
		connection.close();
		return;
	}
  

	const player: PlayerData = {
		id: playerId,
		username: playerUsername,
	};

	connection.playerId = playerId;

	tournament.players.push(player);
	tournament.sockets.add(connection);

	connection.on("close", () =>
	{
		console.log(`Cleaning up closed socket for player ${connection.playerId}`);

		// if (tournament.players.length > 1)
		// {
		// 	tournament.hostId = tournament.players[1].id;
		// 	tournament.hostUsername = tournament.players[1].username;
		// }

		tournament.sockets.delete(connection);
	});

	broadcastTournamentUpdate(tournamentId, "DATA");
}
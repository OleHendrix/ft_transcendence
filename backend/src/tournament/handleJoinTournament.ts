import { tournamentLobbies } 			from "./tournament";
import { PlayerData, TournamentData } 					from "../types/types";
import { broadcastTournamentUpdate } 	from "./broadcastTournamentUpdates";
import type { WebSocket } 				from 'ws';

declare module 'ws' {
	interface WebSocket {
		playerId?: number;
	}
}

function rejoinTournament(tournament: TournamentData, playerId: number, connection: WebSocket)
{
	for (let socket of tournament.sockets) // if player already has a socket
	{
		if (socket.playerId === playerId)
			return ;
	}
	tournament.sockets.add(connection);
	connection.playerId = playerId;
	broadcastTournamentUpdate(tournament.tournamentId, "DATA");
}


export function handleJoinTournament(connection: WebSocket, playerId: number, playerUsername: string, tournamentId: number): void 
{
	if (tournamentId === -1) return ;

	const tournament = tournamentLobbies.get(tournamentId);
	if (!tournament)
	{
		// connection.close();
		throw (`handleJoinTournament:player:${playerId}:triedToJoin:Tournament:${tournamentId}:ERROR_NOT_FOUND`);
	}

	if (tournament.players.find(p => p.id === playerId))
	{
		rejoinTournament(tournament, playerId, connection);
		return;
	}
	if (tournament.players.length >= tournament.maxPlayers)
	{
		// connection.close();
		throw (`handleJoinTournament:Tournament:${tournamentId}:ERROR_TOURNAMENT_FULL`);
	}

	const player: PlayerData = {
		id: playerId,
		username: playerUsername,
	};

	connection.playerId = playerId;

	tournament.players.push(player);
	tournament.sockets.add(connection);

	connection.on("close", () => { tournament.sockets.delete(connection) });

	broadcastTournamentUpdate(tournamentId, "DATA");
}
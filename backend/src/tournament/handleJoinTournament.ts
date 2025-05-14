import { tournamentLobbies } 			from "./tournament";
import { PlayerData, TournamentSocket } 	from "../types/types";
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

	// connection.playerId    = playerId;
	const tsocket          = connection as TournamentSocket;
	tsocket.playerId       = playerId;
	tsocket.playerUsername = playerUsername;
	// const tsocket: TournamentSocket = { playerId, playerUsername, connection };

	if (tournament.players.find(p => p.id === playerId))
	{
		tournament.sockets.add(tsocket);
		console.log(`handleJoinTournament:Player${playerId}:REJOINED:tournament${tournamentId}`);
		broadcastTournamentUpdate(tournamentId, "DATA");
		return;
	}
	if (tournament.players.length >= tournament.maxPlayers)
	{
		console.log(`handleJoinTournament:Tournament:${tournamentId}:ERROR_TOURNAMENT_FULL`);
		connection.close();
		return;
	}
	
	const player: PlayerData =
	{
		id: playerId,
		username: playerUsername,
	};
	
	tournament.players.push(player);
	tournament.sockets.add(tsocket);
	console.log(`ADDING SOCKET WITH PLAYER ID ${tsocket.playerId}`);

	connection.on("close", () =>
	{
		console.log(`Cleaning up closed socket for player ${connection.playerId}`);
		if (tournament.hostId === playerId && tournament.sockets.size > 1)
		{
			const availableSocket = Array.from(tournament.sockets).find(socket => socket.playerId !== playerId);
			if (!availableSocket)
			{
				console.log(`rehost-tournament:ERROR:corrupted_player_in_tournament:id:${tournament.players[1].id}`);
				return ;
			}
			tournament.hostId = availableSocket.playerId;
			tournament.hostUsername = availableSocket.playerUsername;
		}
		tournament.sockets.delete(tsocket);
		console.log(tournament.sockets.size);
		if (tournament.matchRound === 1)
			tournament.players = tournament.players.filter(player => player.id !== playerId);
	
		if (tournament.sockets.size === 0)
		{
			tournamentLobbies.delete(tournamentId);
			return ;
		}
		broadcastTournamentUpdate(tournament.tournamentId, "DATA");
	});
	broadcastTournamentUpdate(tournamentId, "DATA");
}
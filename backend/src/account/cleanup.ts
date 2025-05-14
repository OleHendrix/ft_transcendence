import { tournamentLobbies } 			from "./../tournament/tournament"
import { broadcastTournamentUpdate } from '../tournament/broadcastTournamentUpdates';
import WebSocket from 'ws';

export default async function cleanup(userId: number)
{
	console.log("CLEANUP")
	tournamentLobbies.forEach((tournament, id) =>
	{
		if (tournament.players.some(player => player.id === userId))
		{
			if (tournament.players.length < 2)
				console.log(`rehost-tournament:ERROR:rehosting_tournamentId"${id}":NOT_ENOUGH_PLAYERS_TO_REHOST`);
			else
			{
				if (!tournament.players[1].id || !tournament.players[1].username)
					console.log(`rehost-tournament:ERROR:corrupted_player_in_tournament:id:${tournament.players[1].id}`);
				else
				{
					tournament.hostId = tournament.players[1].id;
					tournament.hostUsername = tournament.players[1].username;
				}
			}
			for (let socket of tournament.sockets)
			{
				if (socket.playerId === userId)
				{
					try
					{
						if (socket.socket.readyState === WebSocket.OPEN)
							socket.socket.close();
						tournament.sockets.delete(socket);
					}
					catch (error)
					{
						console.log(`rehost-tournament:ERROR:closing_socket:${error}`);
					}
				}
			}
			tournament.players = tournament.players.filter(player => player.id !== userId);
	
			if (tournament.players.length === 0)
			{
				tournamentLobbies.delete(id);
				return ;
			}
			broadcastTournamentUpdate(tournament.tournamentId, "DATA");
		}
	})
}
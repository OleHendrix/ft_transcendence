import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { tournamentLobbies } 			from "./../tournament/tournament"
import { TournamentData }	from "./../types/types"
import { broadcastTournamentUpdate } from '../tournament/broadcastTournamentUpdates';

export default async function cleanup(userId: number)
{
	console.log("CLEANUP")
	//check tournament
	tournamentLobbies.forEach((tournament, id) =>
	{
		if (tournament.players.some(player => player.id === userId))
		{
			for (let socket of tournament.sockets)
			{
				if (socket.playerId === userId)
				{
					if (socket.readyState === WebSocket.OPEN)
						socket.close();
					tournament.sockets.delete(socket);
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
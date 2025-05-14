import { FastifyInstance } 		from "fastify/fastify";
import { PlayerData, Match, TournamentSocket } 	from "../types/types";
import { tournamentLobbies } 	from "./tournament";
import { WebSocket } 			from 'ws';

export async function createTournament(fastify: FastifyInstance)
{
	fastify.register(async function (fastify)
	{
		fastify.post('/api/create-tournament', (request, reply) =>
		{
			try
			{
				const { hostId, hostUsername, maxPlayers } = request.body as 
				{
					hostId: number;
					hostUsername: string;
					maxPlayers: string;
				};

				let tournamentId = 0;
				while (1)
				{
					tournamentId = Math.floor(1000 + Math.random() * 9000); // 1000-9999
					if (!tournamentLobbies.has(tournamentId))
						break;
				}
				
				const sockets = new Set<TournamentSocket>();
				const players: PlayerData[] = [];
				const winners: PlayerData[][] = [];
				const rounds: Match[][] = [];
				const winner = null;
				const tournamentData = 
				{
					tournamentId,
					hostId,
					hostUsername,
					players,
					winners,
					winner,
					roundIdx: 0,
					matchRound: 1,
					maxPlayers: Number(maxPlayers),
					rounds,
					sockets,
					readyForNextRound: false
				};

				tournamentLobbies.set(tournamentId, tournamentData);
				reply.send( {success: true, tournamentId: tournamentId } );
			}
			catch (error)
			{
				console.log(error);
			}
		})
	});
}
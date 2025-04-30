import { FastifyInstance } 		from "fastify/fastify";
import { PlayerData, Match } 	from "../types/types";
import { tournamentLobbies } 	from "./tournament";
import { WebSocket } 			from 'ws';

export async function createTournament(fastify: FastifyInstance)
{
	fastify.register(async function (fastify)
	{
		fastify.post('/api/create-tournament', (request, reply) => {
			try {
				const { hostId, hostUsername, maxPlayers } = request.body as {
					hostId: number;
					hostUsername: string;
					maxPlayers: string;
				};
				
				let tournamentId = 0;
				while (tournamentLobbies.has(tournamentId)) tournamentId++;
				
				const sockets = new Set<WebSocket>();
				const players: PlayerData[] = [];
				const winners: PlayerData[][] = [];
				const rounds: Match[][] = [];
				const winner = null;
				
				const tournamentData = {
					tournamentId,
					hostId,
					hostUsername,
					players,
					winners,
					winner,
					roundIdx: 0,
					maxPlayers: Number(maxPlayers),
					rounds,
					sockets,
				};

				tournamentLobbies.set(tournamentId, tournamentData);
				reply.send( { tournamentId: tournamentId } );
			} catch (error){
				console.log(error);
			}
		})
	});
}
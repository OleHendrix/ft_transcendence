import { FastifyInstance } 		from "fastify/fastify";
import { PlayerData } 			from "../types/types";
import { tournamentLobbies } 	from "./tournament";
import { WebSocket } 			from 'ws';

export async function createTournament(fastify: FastifyInstance)
{
	fastify.register(async function (fastify)
	{
		fastify.post('/api/create-tournament', (request, reply) => {
			try {
				const { hostId, hostUsername, maxPlayers } = request.body as {
					hostId: string;
					hostUsername: string;
					maxPlayers: string;
				};
				
				let tournamentId = 0;
				while (tournamentLobbies.has(tournamentId)) tournamentId++;
				
				const sockets = new Set<WebSocket>();
				const players: PlayerData[] = [];
				
				const tournamentData = {
					tournamentId,
					// hostId,
					hostUsername,
					players,
					maxPlayers: Number(maxPlayers),
					rounds: null,
					sockets,
				};

				tournamentLobbies.set(tournamentId, tournamentData);
				// console.log(tournamentLobbies);
				reply.send( { tournamentId: tournamentId } );
			} catch (error){
				console.log(error);
			}
		})
	});
}
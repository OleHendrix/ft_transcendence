import { tournamentLobbies } from "./tournament";
import { FastifyInstance } from "fastify/fastify";

export async function getTournamentLobbies(fastify: FastifyInstance)
{
	fastify.get('/api/get-tournament-lobbies', async (request, reply) => {
		const lobbySummaries = Array.from(tournamentLobbies.entries()).map(
			([tournamentId, lobby]) => ({
				tournamentId,
				hostUsername: lobby.players[0]?.username || 'Unknown',
				currentPlayers: lobby.players.length,
				maxPlayers: lobby.maxPlayers,
			})
		);

		reply.send(lobbySummaries);
	})
}
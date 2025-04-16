import { FastifyInstance } 		from "fastify/fastify";
import { tournamentLobbies } 	from "./tournament";

export async function getTournamentById(fastify: FastifyInstance) {
	fastify.get('/api/get-tournament/:id', async (request, reply) => {
		const { id } = request.params as { id: string };
		const tournamentId = parseInt(id, 10);

		if (isNaN(tournamentId)) {
			return reply.status(400).send({ error: "Invalid tournament ID" });
		}

		const tournament = tournamentLobbies.get(tournamentId);

		if (!tournament) {
			return reply.status(404).send({ error: "Tournament not found" });
		}

		const tournamentInfo = {
			tournamentId,
			hostUsername: tournament.players[0]?.username || "Unknown",
			players: tournament.players.map(player => player.username),
			maxPlayers: tournament.maxPlayers,
			currentPlayers: tournament.players.length,
			roundsStarted: tournament.rounds !== null,
		};

		reply.send(tournamentInfo);
	});
}
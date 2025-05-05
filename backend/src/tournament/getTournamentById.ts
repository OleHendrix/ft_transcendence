import { FastifyInstance } 		from "fastify/fastify";
import { tournamentLobbies } 	from "./tournament";

export async function getTournamentById(fastify: FastifyInstance)
{
	fastify.get('/api/tournament-data/:id', async (request, reply) =>
	{
		const { id } = request.params as { id: string };
		const tournamentId = parseInt(id, 10);
	
		if (isNaN(tournamentId) || tournamentId === -1)
			return reply.status(400).send({ error: "Invalid tournament ID" });
	
		const tournament = tournamentLobbies.get(tournamentId);
		if (!tournament)
			return reply.status(404).send({ error: "Tournament not found" });
	
		return reply.send({success: true, tournament: tournament});
	});
	
}
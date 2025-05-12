import { FastifyInstance } from "fastify/fastify";
import { tournamentLobbies } from "./tournament";

export async function findTournamentSocket(fastify: FastifyInstance)
{
	fastify.get('/api/find-tournament-socket', (request, reply) => 
	{
		try
		{
		const { playerId, id } = request.query as 
		{
			playerId: string,
			id: string
		}
		const pId = Number(playerId);
		const tId = Number(id);

		const tournament = tournamentLobbies.get(tId);
		if (!tournament)
		{
			console.log(`cannot find tId ${tId}`);
			return reply.status(404).send({error: `findTournamentSocket:Tournament:${tId}:ERROR_NOT_FOUND`});
		}

		for (let socket of tournament.sockets)
			{
				if (socket.playerId === pId)
					return reply.status(200).send({found: true, socket: socket});
			}
			return reply.status(200).send({found: false});
		}
		catch (error )
		{
			console.error("💥 Uncaught error in findTournamentSocket:", error);
			return reply.status(500).send({ error: "Internal Server Error" });
		}
	})
}
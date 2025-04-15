import { FastifyInstance } from "fastify/fastify";
import { tournamentLobbies } from "./tournament";
import { broadcastTournamentUpdate } from "./broadcastTournamentUpdates";

export async function leaveTournament(fastify: FastifyInstance)
{
	fastify.post('/api/leave-tournament', async (request, reply) => {
		const { playerId, tournamentId } = request.body as { playerId: number, tournamentId: number };
		console.log(`player ${playerId} leaving tournament ${tournamentId}`);
		let tournament = tournamentLobbies.get(tournamentId);
		if (!tournament)
			return reply.status(400).send({ error: "Invalid tournament ID" });

		for (let socket of tournament.sockets) {
			if (socket.playerId === playerId) {
				socket.close();
				tournament.sockets.delete(socket);
			}
		}

		tournament.players = tournament.players.filter(player => player.id !== playerId);

		if (tournament.players.length === 0) 
			tournamentLobbies.delete(tournamentId);

		broadcastTournamentUpdate(tournamentId);
	})
}
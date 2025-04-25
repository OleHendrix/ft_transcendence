import { FastifyInstance } 				from "fastify/fastify";
import { tournamentLobbies } 			from "./tournament";
import { broadcastTournamentUpdate } 	from "./broadcastTournamentUpdates";


export async function leaveTournament(fastify: FastifyInstance)
{
	fastify.post('/api/leave-tournament', async (request, reply) => {
		const { playerId, tournamentId } = request.body as { playerId: number, tournamentId: number };

		let tournament = tournamentLobbies.get(tournamentId);
		if (!tournament)
			return reply.status(500).send({ error: `player ${playerId} tried to leave invalid tournamentid: ${tournamentId}` });

		//Host leaves close everything 
		if ( playerId === tournament.hostId)
		{
			for (let socket of tournament.sockets) {
				socket.close();
				tournament.sockets.delete(socket);
			}
			tournamentLobbies.delete(tournamentId);
			return ;
		}

		for (let socket of tournament.sockets) {
			if (socket.playerId === playerId) {
				socket.close();
				tournament.sockets.delete(socket);
			}
		}

		tournament.players = tournament.players.filter(player => player.id !== playerId);

		if (tournament.players.length === 0) 
			tournamentLobbies.delete(tournamentId);

		broadcastTournamentUpdate(tournamentId, "UPDATE");
	})
}
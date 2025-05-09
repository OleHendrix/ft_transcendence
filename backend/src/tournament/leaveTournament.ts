import { FastifyInstance } 				from "fastify/fastify";
import { tournamentLobbies } 			from "./tournament";
import { broadcastTournamentUpdate } 	from "./broadcastTournamentUpdates";

export async function leaveTournament(fastify: FastifyInstance)
{
	fastify.post('/api/leave-tournament', async (request, reply) =>
	{
		const { playerId, id } = request.body as { playerId: number, id: number };
		
		let tournament = tournamentLobbies.get(id);
		if (!tournament)
			return reply.status(500).send({ error: `player ${playerId} tried to leave invalid tournamentid: ${id}` });
		for (let socket of tournament.sockets)
		{
			if (socket.playerId === playerId)
			{
				if (socket.readyState === WebSocket.OPEN)
					socket.close();
				tournament.sockets.delete(socket);
			}
		}
		if (tournament.matchRound === 1)
			tournament.players = tournament.players.filter(player => player.id !== playerId);
		console.log(tournament.sockets.size);

		const allSocketsDisconnected = Array.from(tournament.sockets).every(socket =>
			socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING
		);

		if (allSocketsDisconnected)
		{
			console.log("ALL SOCKETS DISCONNECTED");
			tournamentLobbies.delete(id);
			return ;
		}

		broadcastTournamentUpdate(id, "DATA");
	})
}
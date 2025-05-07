import { FastifyInstance } 		from "fastify/fastify";
import { handleJoinTournament } from "./handleJoinTournament";
import { broadcastTournamentUpdate } from "./broadcastTournamentUpdates";

export async function joinTournament(fastify: FastifyInstance)
{
	fastify.register(async function (fastify)
	{
		fastify.get('/ws/join-tournament', { websocket: true }, (connection, req) =>
		{
			// console.log("JOIN TOURNAMENT");
			try
			{
				const { playerId, playerUsername, tournamentId } = req.query as {
					playerId: string;
					playerUsername: string;
					tournamentId: string;
				};
				handleJoinTournament(connection, Number(playerId), playerUsername, Number(tournamentId));
				broadcastTournamentUpdate(Number(tournamentId), "DATA");
			}
			catch (error)
			{
				console.log(error);
				return ;
			}
		})
	});
}
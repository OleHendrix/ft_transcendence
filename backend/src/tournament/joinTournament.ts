import { FastifyInstance } 		from "fastify/fastify";
import { handleJoinTournament } from "./handleJoinTournament";


export async function joinTournament(fastify: FastifyInstance)
{
	fastify.register(async function (fastify)
	{
		fastify.get('/ws/join-tournament', { websocket: true }, (connection, req) => {
			try {
				console.log(req.query);
				const { playerId, playerUsername, tournamentId } = req.query as {
					playerId: string;
					playerUsername: string;
					tournamentId: string;
				};
	
				handleJoinTournament(connection, Number(playerId), playerUsername, Number(tournamentId));

			} catch (error){
				console.log(error);
			}
		})
	});
}
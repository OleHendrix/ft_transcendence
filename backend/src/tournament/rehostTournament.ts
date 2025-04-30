import { FastifyInstance } 				from "fastify/fastify";
import { tournamentLobbies } 			from "./tournament";
import { broadcastTournamentUpdate } 	from "./broadcastTournamentUpdates";


export async function rehostTournament(fastify: FastifyInstance){
	fastify.post(`/api/rehost-tournament`, (request, reply) => {
		try {
			const { tournamentId } 	= request.body as { tournamentId: number }
			const tournament 		= tournamentLobbies.get(tournamentId);
			if (!tournament) 					return reply.status(500).send(`rehost-tournament:ERROR:invalid_tournamentId:${tournamentId}`)
			if (tournament.players.length < 2) 	return reply.status(500).send(`rehost-tournament:ERROR:rehosting_tournamentId"${tournamentId}:NOT_ENOUGH_PLAYERS_TO_REHOST`);
			
			if (!tournament.players[1].id || !tournament.players[1].username)
				return console.log(`rehost-tournament:ERROR:corrupted_player_in_tournament:id:${tournament.players[1].id}`);

			tournament.hostId 		= tournament.players[1].id;
			tournament.hostUsername = tournament.players[1].username;

			broadcastTournamentUpdate(tournamentId, "DATA");
			return reply.status(200).send({ message: "Rehost successful" });
		} catch (error){
			return reply.status(500).send({ error: "Internal Server Error" });
		}
	})
}
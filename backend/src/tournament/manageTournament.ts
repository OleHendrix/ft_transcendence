import { FastifyInstance } 					from "fastify/fastify";
import { tournamentLobbies } 				from "./tournament";
import { Result, Round } 					from "../types/types";
import { broadcastTournamentUpdate } 		from "./broadcastTournamentUpdates";
import { addGame } 							from "../pong/pongServer";
import { setRounds } 						from "./setRounds";

export async function manageTournament(fastify: FastifyInstance)
{
	fastify.post('/api/start-tournament', async (request, reply) =>
	{
		const { tournamentId } = request.body as { tournamentId: number };
		// console.log("Tournament starting:", tournamentId);
		const lobby = tournamentLobbies.get(tournamentId);
		if (!lobby) 
				return reply.status(404).send({ error: 'Tournament not found' });
		if (!lobby.rounds) 
			setRounds(tournamentId);
		if (!lobby.rounds) return ; 

		for(const round of lobby.rounds)
		{
			addGame(round.p1, round.p2, false, tournamentId);
		}
		return reply.send({ succes: true });
	});

	fastify.post('/api/start-next-round', async (request, reply) => {
		const { tournamentId } = request.body as { tournamentId: number };

		const lobby = tournamentLobbies.get(tournamentId);
		if (!lobby) 
			return reply.status(404).send({ error: 'Tournament not found' });

		if (!lobby.rounds) 
			return reply.status(500).send({ error: 'NO ROUNDS' });

		if (allRoundsFinished(lobby.rounds))
		{
			let winners = [];
			for (const round of lobby.rounds)
			{
				winners.push(round.result === Result.P1WON ? round.p1 : round.p2);
			}
			lobby.players = winners;
			lobby.rounds = [];

			if (lobby.players.length === 1)
			{
				tournamentLobbies.delete(tournamentId);
				broadcastTournamentUpdate(tournamentId, "WINNER_WINNER_CHICKEN_DINNER");
				return reply.send({ winner: lobby.players.pop()?.username });
			}
			
			setRounds(tournamentId);
			broadcastTournamentUpdate(tournamentId, "PLAYER_UPDATE");

			for(const round of lobby.rounds)
			{
				addGame(round.p1, round.p2, false, tournamentId);
			}

			return reply.send({ roundFinished: true });
			}
		broadcastTournamentUpdate(tournamentId, "RESULT_UPDATE");
		return reply.send({ roundFinished: false, message: 'Waiting for more results' });
	});
}

function allRoundsFinished(rounds: Round[])
{
	for (const round of rounds)
	{
		if (round.result === Result.PLAYING)
			return false;
	}
	return true;
}
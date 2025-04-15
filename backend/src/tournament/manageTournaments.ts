import { FastifyInstance } from "fastify/fastify";
import { tournamentLobbies } from "./tournament";
import { Result } from "../types/types";

export async function manageTournaments(fastify: FastifyInstance)
{
	fastify.post('/api/tournament', async (request, reply) => // rename
	{
		for (const [id, lobby] of tournamentLobbies)
		{
			if (!lobby.rounds) continue;

			let allFinished = true;

			for (const round of lobby.rounds)
			{
				if (round.result === Result.PLAYING)
					allFinished = false; continue;
			}

			if (allFinished)
			{
				let winners = [];
				for (const round of lobby.rounds)
				{
					winners.push(round.result === Result.P1WON ? round.p1 : round.p2);
				}
				lobby.players = winners;
				lobby.rounds = [];

				for (let i = 0; i < winners.length; i += 2)
				{
					lobby.rounds.push({
						p1:			winners[i],
						p2:			winners[i + 1],
						p1score:	0,
						p2score:	0,
						result:		Result.PLAYING,
					});
				}
			}
		}
	});
}
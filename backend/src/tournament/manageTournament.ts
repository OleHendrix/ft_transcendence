import { FastifyInstance } 					from "fastify/fastify";
import { tournamentLobbies } 				from "./tournament";
import { Result, TournamentData } 			from "../types/types";
import { broadcastTournamentUpdate } 		from "./broadcastTournamentUpdates";
import { addGame } 							from "../pong/pongServer";
import { setMatches } 						from "./setMatches";

export async function manageTournament(fastify: FastifyInstance)
{
	fastify.post('/api/start-tournament', async (request, reply) =>
	{
		const { tournamentId } = request.body as { tournamentId: number };
		const tournament = tournamentLobbies.get(tournamentId);
		if (!tournament) return reply.status(404).send({ error: 'Tournament not found' });
	
		if (!tournament.rounds) tournament.rounds = [];
		tournament.rounds[0] = [];

		setMatches(tournament);
		if (!tournament.rounds) return reply.status(401).send({ succes: false, error: "Failed to set matches"});

		for(const match of tournament.rounds[0])
		{
			addGame(match.p1, match.p2, false, tournamentId);
		}
		broadcastTournamentUpdate(tournamentId, "START_SIGNAL");
		return reply.send({ succes: true });
	});

	//everytime a game finishes this is called
	fastify.post('/api/start-next-round', async (request, reply) => {
		const { tournamentId } = request.body as { tournamentId: number };

		const t = tournamentLobbies.get(tournamentId);
		if (!t) 		return reply.status(404).send({ error: 'Tournament not found' });
		if (!t.rounds) 	return reply.status(500).send({ error: 'NO ROUNDS' });

		if (allMatchesFinished(t))
		{
			console.log(`manageTournaments:allMatchesFinished:RoundIdx${t.roundIdx}`);
			t.winners[t.roundIdx] = [];
			for (const match of t.rounds[t.roundIdx])
			{
				t.winners[t.roundIdx].push(match.state.result === Result.P1WON ? match.p1 : match.p2);
			}
			t.roundIdx ++;
			t.rounds[t.roundIdx] = [];
			
			if (t.players.length === 1)
			{
				tournamentLobbies.delete(tournamentId);
				broadcastTournamentUpdate(tournamentId, "UPDATE");
				return reply.send({ winner: t.players.pop()?.username });
			}
			setMatches(t);

			for(const match of t.rounds[t.roundIdx])
			{
				addGame(match.p1, match.p2, false, tournamentId);
			}
			broadcastTournamentUpdate(tournamentId, "UPDATE");

			return reply.send({ roundFinished: true });
		}
		return reply.send({ roundFinished: false, message: 'Waiting for more results' });
	});
}

function allMatchesFinished(t: TournamentData)
{
	if (!t.rounds) return;
	for (const round of t.rounds[t.roundIdx])
	{
		if (round.state.result === Result.PLAYING)
			return false;
	}
	return true;
}
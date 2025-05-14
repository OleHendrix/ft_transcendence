import { FastifyInstance } 					from "fastify/fastify";
import { tournamentLobbies } 				from "./tournament";
import { Result, TournamentData } 			from "../types/types";
import { broadcastTournamentUpdate } 		from "./broadcastTournamentUpdates";
import { addGame } 							from "../pong/pongServer";
import { setMatches } 						from "./setMatches";

export async function manageTournament(fastify: FastifyInstance)
{
	fastify.post('/api/start-tournament',
		{
			preHandler: fastify.authenticate
		},
		async (request, reply) =>
	{
		const { id } = request.body as { id: number };
		const tournament = tournamentLobbies.get(id);
		if (!tournament) return reply.status(404).send({ error: 'Tournament not found' });
		
		setMatches(tournament);
		if (!tournament.rounds) return reply.status(401).send({ error: "Failed to set matches"});
		
		for (const match of tournament.rounds[0])
			addGame(match.p1, match.p2, false, id);
		
		tournament.matchRound++;
		
		broadcastTournamentUpdate(id, "DATA");
		broadcastTournamentUpdate(id, "START_SIGNAL");
		return reply.status(200).send({ succes: true });
	});

	fastify.post('/api/start-next-round',
		{
			preHandler: fastify.authenticate
		},
		async (request, reply) => 
	{
		const { id } = request.body as { id: number };
		const t = tournamentLobbies.get(id);
		if (!t) 		return reply.status(404).send({ error: 'Tournament not found' });
		if (!t.rounds) 	return reply.status(500).send({ error: 'NO ROUNDS' });

		t.roundIdx ++;
		t.rounds[t.roundIdx] = [];
		
		setMatches(t);

		for (const match of t.rounds[t.roundIdx])
			addGame(match.p1, match.p2, false, id);

		t.matchRound++;
		t.readyForNextRound = false;
		broadcastTournamentUpdate(id, "DATA");
		broadcastTournamentUpdate(id, "START_SIGNAL");
	});
}

export function allMatchesFinished(t: TournamentData)
{
	if (!t.rounds) return;
	for (const match of t.rounds[t.roundIdx])
	{
		if (match.state.result === Result.PLAYING)
			return false;
	}
	return true;
}
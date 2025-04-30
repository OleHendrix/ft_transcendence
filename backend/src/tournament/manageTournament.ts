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

		setMatches(tournament);
		if (!tournament.rounds) return reply.status(401).send({ error: "Failed to set matches"});

		for(const match of tournament.rounds[0])
		{
			addGame(match.p1, match.p2, false, tournamentId);
		}
		broadcastTournamentUpdate(tournamentId, "DATA");
		broadcastTournamentUpdate(tournamentId, "START_SIGNAL");
		return reply.status(200).send({ succes: true });
	});

	fastify.post('/api/start-next-round', async (request, reply) => 
	{
		const { tournamentId } = request.body as { tournamentId: number };
		const t = tournamentLobbies.get(tournamentId);
		if (!t) 		return reply.status(404).send({ error: 'Tournament not found' });
		if (!t.rounds) 	return reply.status(500).send({ error: 'NO ROUNDS' });

		// console.log(`manageTournaments:allMatchesFinished:RoundIdx${t.roundIdx}`);
		// t.winners[t.roundIdx] = [];
		// for (const match of t.rounds[t.roundIdx])
		// {
		// 	t.winners[t.roundIdx].push(match.state.result === Result.P1WON ? match.p1 : match.p2);
		// }
		t.roundIdx ++;
		t.rounds[t.roundIdx] = [];
		
		// if (t.players.length === 1)
		// {
		// 	tournamentLobbies.delete(tournamentId);
		// 	broadcastTournamentUpdate(tournamentId, "DATA");
		// 	return reply.send({ winner: t.players.pop()?.username });
		// }
		setMatches(t);

		for(const match of t.rounds[t.roundIdx])
		{
			addGame(match.p1, match.p2, false, tournamentId);
		}
		broadcastTournamentUpdate(tournamentId, "DATA");
		broadcastTournamentUpdate(tournamentId, "START_SIGNAL");
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
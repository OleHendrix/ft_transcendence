import { FastifyInstance } from "fastify";
import { tournamentLobbies } 	from "./tournament";
import { WebSocket }			from "ws";
import { PrismaClient } from "@prisma/client";
import { TournamentData } 		from "../types/types";
interface SerializableTournamentData extends Omit<TournamentData, "sockets"> {}


function sanitizeTournament(tournament: TournamentData): SerializableTournamentData
{
	const { sockets, ...sanitized } = tournament;
	return sanitized;
}


export function broadcastTournamentUpdate(tournamentId: number, type: string)
{
	const tournament = tournamentLobbies.get(tournamentId);
	if (!tournament) return console.log(`broadcastTournamentUpdate:ERROR_WHEN_GETTING_TOURNAMENT:ID:${tournamentId}`);

	const currentRound = tournament.rounds?.[tournament.roundIdx] || [];
	const activePlayerIds = currentRound.flatMap(match => [match.p1.id, match.p2.id]);
	
	let payload;
	if (type === "DATA")
	{
		payload =
		{
			type,
			tournament: sanitizeTournament(tournament)
		};
	}
	else if (type === "START_SIGNAL")
	{
		payload =
		{
			type,
			data: { start: true, activePlayerIds}
		};
	}
	else if (type === "READY_FOR_NEXT_ROUND")
	{
		payload = 
		{
			type,
			data: { ready: true }
		}
	}
	else 
	{
		console.warn("Unknown broadcast type:", type);
		return;
	}

	const message = JSON.stringify(payload);

	tournament.sockets.forEach(socket =>
	{
		if (socket.socket.readyState === WebSocket.OPEN)
			socket.socket.send(message);
	});
}


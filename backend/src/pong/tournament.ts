import { FastifyInstance } from "fastify";
import { PlayerData, TournamentData, Result } from "./types";

let tournamentLobbies = new Map<number, TournamentData>();

export async function createTournament(fastify: FastifyInstance)
{
	fastify.post('/api/create-tournament', async (request, reply) =>
	{
		const { host, maxPlayers } = request.body as { host: PlayerData, maxPlayers: number };

		let key;
		for (key = 0; tournamentLobbies.has(key); key++);

		let tournamentData = { players: [ host ], maxPlayers: maxPlayers, rounds: null };
		
		tournamentLobbies.set(key, tournamentData );

		return reply.send({ tournamentId: key });
	});
}

export async function joinTournament(fastify: FastifyInstance)
{
	fastify.post('/api/join-tournament', async (request, reply) =>
	{
		const { player, tournamentId } = request.body as { player: PlayerData, tournamentId: number };

		let lobby = tournamentLobbies.get(tournamentId);
		if (!lobby)
			return reply.status(404).send({ error: 'Tournament not found'});

		if (lobby.players.length >= lobby.maxPlayers)
			return reply.send({ error: 'Tournament already full'});

		lobby.players.push(player);

		if (lobby.players.length == lobby.maxPlayers)
		{
			setRounds(tournamentId);
			return reply.send({ start: true, rounds: lobby.rounds });
		}

		return reply.send({ message: 'Joined the tournament succesfully!'});
	});
}

export async function manageTournaments(fastify: FastifyInstance)
{
	fastify.post('/api/tournament', async (request, reply) =>
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
						p1: winners[i],
						p2: winners[i + 1],
						result: Result.PLAYING,
					});
				}
			}
		}
	});
}

async function setRounds(tournamentId: number)
{
	let lobby = tournamentLobbies.get(tournamentId);
	if (!lobby)
		return null;

	if (!lobby.rounds) lobby.rounds = [];

	for (let i = 0; i < lobby.players.length; i += 2)
	{
		lobby.rounds?.push({
			p1: lobby.players[i],
			p2: lobby.players[i + 1],
			result: Result.PLAYING
		});
	}
}
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

		tournamentLobbies.set(key, tournamentData);
		console.log('created Tournament with id:', key, tournamentLobbies);
		return reply.send({ tournamentId: key });
	});
}

export async function joinTournament(fastify: FastifyInstance)
{
	fastify.post('/api/join-tournament', async (request, reply) =>
	{
		const { player, tournamentId } = request.body as { player: PlayerData, tournamentId: number };

		console.log('hallo', player.username, tournamentId);
		let lobby = tournamentLobbies.get(tournamentId);
		if (!lobby)
			return reply.status(404).send({ start: false, error: 'Tournament not found'});

		if (lobby.players.length >= lobby.maxPlayers)
			return reply.send({ start: false, error: 'Tournament already full'});

		lobby.players.push(player);
		
		console.log('added', player.username, 'to tournament', tournamentId);
		if (lobby.players.length == lobby.maxPlayers)
		{
			setRounds(tournamentId);
			console.log(JSON.stringify(lobby, null, 2));
			return reply.send({ start: true, rounds: lobby.rounds });
		}
		return reply.send({ start: false, message: 'Joined the tournament succesfully!'});
	});
}

export async function manageTournaments(fastify: FastifyInstance)
{
	fastify.post('/api/tournament', async (request, reply) =>
	{
		const { tournamentId } = request.body as { tournamentId: number };

		const lobby = tournamentLobbies.get(tournamentId);
		if (!lobby)
			return reply.status(404).send({ error: 'Tournament not found' });

		if (!lobby.rounds)
			return reply.send({ message: 'Tournament has no rounds yet' });

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

			if (lobby.players.length === 1)
			{
				tournamentLobbies.delete(tournamentId);
				return reply.send({ end: true, winner: lobby.players.pop()?.username });
			}

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
			return reply.send({ end: false, rounds: lobby.rounds });
		}
		return reply.send({ end: false, message: 'Waiting for more results' });
	});
}

export async function getTournamentLobbies(fastify: FastifyInstance)
{
	fastify.get('/api/get-tournament-lobbies', async (request, reply) => {
		
		for (const lobby of tournamentLobbies)
		{

		}
	})
}

function setRounds(tournamentId: number)
{
	let lobby = tournamentLobbies.get(tournamentId);
	if (!lobby)
		return null;

	if (!lobby.rounds) lobby.rounds = [];

	for (let i = 0; i < lobby.players.length; i += 2)
	{
		lobby.rounds?.push({
			p1:			lobby.players[i],
			p2:			lobby.players[i + 1],
			p1score:	0,
			p2score:	0,
			result:		Result.PLAYING
		});
	}
}

export function setResults(tournamentId: number, p1: number, p1score: number, p2score: number, result: Result)
{
	let lobby = tournamentLobbies.get(tournamentId);
	if (!lobby)
		return ;

	let round = lobby.rounds?.find(round => round.p1.id === p1);
	if (!round)
		return ;

	round.p1score = p1score;
	round.p2score = p2score;
	round.result = result;
}
import { FastifyInstance } from "fastify";
import { PlayerData, TournamentData, Result } from "./types";
import { WebSocket } from 'ws';
import 'ws';

declare module 'ws' {
	interface WebSocket {
		playerId?: number;
	}
}

let tournamentLobbies = new Map<number, TournamentData>();

export async function createTournament(fastify: FastifyInstance)
{
	fastify.register(async function (fastify)
	{
		fastify.post('/api/create-tournament', (request, reply) => {
			const { hostId, hostUsername, maxPlayers } = request.body as {
				hostId: string;
				hostUsername: string;
				maxPlayers: string;
			};
			
			let tournamentId = 1;
			while (tournamentLobbies.has(tournamentId)) tournamentId++;
			
			const sockets = new Set<WebSocket>();
			const players: PlayerData[] = [];
			
			const tournamentData = {
				tournamentId,
				hostUsername,
				players,
				maxPlayers: Number(maxPlayers),
				rounds: null,
				sockets,
			};

			tournamentLobbies.set(tournamentId, tournamentData);
			reply.send( { tournamentId: tournamentId } );
		})
	});
}

export async function joinTournament(fastify: FastifyInstance)
{
	fastify.register(async function (fastify)
	{
		fastify.get('/ws/join-tournament', { websocket: true }, (connection, req) => {
			const { playerId, playerUsername, tournamentId } = req.query as {
				playerId: string;
				playerUsername: string;
				tournamentId: string;
			};

			handleJoinTournament(connection, Number(playerId), playerUsername, Number(tournamentId));
		})
	});
}

function handleJoinTournament(connection: WebSocket, playerId: number, playerUsername: string, tournamentId: number): void 
{
	const tournament = tournamentLobbies.get(tournamentId);
	if (!tournament) {
		console.log(`Tournament ${tournamentId} not found`);
		connection.close();
		return;
	}

	if (tournament.players.length >= tournament.maxPlayers) {
		console.log(`Tournament ${tournamentId} already full`);
		connection.close();
		return;
	}
  
	if (tournament.players.find(p => p.id === playerId)) {
		console.log(`Player ${playerId} already in tournament`);
		return;
	}

	const player: PlayerData = {
		id: playerId,
		username: playerUsername,
	};

	connection.playerId = playerId;

	tournament.players.push(player);
	tournament.sockets.add(connection);
  
	broadcastTournamentUpdate(tournamentId);
  
	connection.on("close", () => {
		tournament.players = tournament.players.filter(p => p.id !== playerId);
		tournament.sockets.delete(connection);
		broadcastTournamentUpdate(tournamentId);
	});
}

function broadcastTournamentUpdate(tournamentId: number) {
	const tournament = tournamentLobbies.get(tournamentId);
	if (!tournament) return;

	const payload = {
		type: "TOURNAMENT_UPDATE",
		tournament: {
			tournamentId: tournament.tournamentId,
			hostUsername: tournament.hostUsername,
			maxPlayers: tournament.maxPlayers,
			players: tournament.players.map(p => p.username),
		},
	};
	console.log(`broadcast ${ JSON.stringify( tournament.players) }`);
	const message = JSON.stringify(payload);

	tournament.sockets.forEach(socket => {
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(message);
		}
	});
}

export async function leaveTournament(fastify: FastifyInstance)
{
	fastify.post('/api/leave-tournament', async (request, reply) => {
		const { playerId, tournamentId } = request.body as { playerId: number, tournamentId: number };

		let tournament = tournamentLobbies.get(tournamentId);
		if (!tournament)
			return reply.status(400).send({ error: "Invalid tournament ID" });

		for (let socket of tournament.sockets) {
			if (socket.playerId === playerId) {
				socket.close();
				tournament.sockets.delete(socket);
			}
		}

		tournament.players = tournament.players.filter(player => player.id !== playerId);

		if (tournament.players.length === 0) 
			tournamentLobbies.delete(tournamentId);

		broadcastTournamentUpdate(tournamentId);
	})
}

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

export async function getTournamentById(fastify: FastifyInstance) {
	fastify.get('/api/get-tournament/:id', async (request, reply) => {
		const { id } = request.params as { id: string };
		const tournamentId = parseInt(id, 10);

		if (isNaN(tournamentId)) {
			return reply.status(400).send({ error: "Invalid tournament ID" });
		}

		const tournament = tournamentLobbies.get(tournamentId);

		if (!tournament) {
			return reply.status(404).send({ error: "Tournament not found" });
		}

		const tournamentInfo = {
			tournamentId,
			hostUsername: tournament.players[0]?.username || "Unknown",
			players: tournament.players.map(player => player.username),
			maxPlayers: tournament.maxPlayers,
			currentPlayers: tournament.players.length,
			roundsStarted: tournament.rounds !== null,
		};

		reply.send(tournamentInfo);
	});
}

export async function getTournamentLobbies(fastify: FastifyInstance)
{
	fastify.get('/api/get-tournament-lobbies', async (request, reply) => {
		const lobbySummaries = Array.from(tournamentLobbies.entries()).map(
			([tournamentId, lobby]) => ({
				tournamentId,
				hostUsername: lobby.players[0]?.username || 'Unknown',
				currentPlayers: lobby.players.length,
				maxPlayers: lobby.maxPlayers,
			})
		);

		reply.send(lobbySummaries);
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
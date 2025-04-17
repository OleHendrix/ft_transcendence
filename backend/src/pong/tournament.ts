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
		fastify.get('/ws/create-tournament', { websocket: true }, (connection, req) => {
			const { hostId, hostUsername, maxPlayers } = req.query as {
				hostId: string;
				hostUsername: string;
				maxPlayers: string;
			};
		
			let tournamentId = 1;
			while (tournamentLobbies.has(tournamentId)) tournamentId++;
		
			connection.playerId = Number(hostId);
			const sockets = new Set<WebSocket>();
			sockets.add(connection);
		
			const tournamentData = {
				players: [{ id: Number(hostId), username: hostUsername }],
				maxPlayers: Number(maxPlayers),
				rounds: null,
				sockets: new Set([connection])
			};

		
			tournamentLobbies.set(tournamentId, tournamentData);

			connection.send(JSON.stringify({ tournamentId }));
		
			connection.on("close", () => {
				console.log(`Tournament ${tournamentId} creator disconnected`);
			});
		})
	});
}

function broadcastTournamentUpdate(tournamentId: number, updatedData: TournamentData) {
	console.log(`broadcasting: ${JSON.stringify(updatedData)} to:`, tournamentId);
	let tournament = tournamentLobbies.get(tournamentId);
	if (!tournament) return;

	tournament.sockets.forEach(socket => {
		socket.send(JSON.stringify({
			type: "TOURNAMENT_UPDATE",
			tournament: updatedData,
		}));
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

			let tournament = tournamentLobbies.get(Number(tournamentId));
			if (!tournament)
				return console.log("Tournament not found");
			if (tournament.players.length >= tournament.maxPlayers)
				return console.log("Tournament already full");

			const parsedPlayer: PlayerData = {
				id: Number(playerId),
				username: playerUsername,
			};

			connection.playerId = Number(playerId);

			tournament.players.push(parsedPlayer);
			tournament.sockets.add(connection);

			broadcastTournamentUpdate(Number(tournamentId), tournament);

			connection.on("close", () => {
				console.log(`Tournament: ${tournamentId} player: ${ parsedPlayer.id } disconnected`);
			});
		})
	});
}

export async function leaveTournament(fastify: FastifyInstance)
{
	fastify.post('/api/leave-tournament', async (request, reply) => {
		const { playerId, tournamentId } = request.body as { playerId: number, tournamentId: number };
		console.log(`player ${ playerId} leaving tournament ${tournamentId}`);

		let tournament = tournamentLobbies.get(tournamentId);
		if (!tournament)
			return reply.status(400).send({ error: "Invalid tournament ID" });

		for (let socket of tournament.sockets) {
			if (socket.playerId = playerId) {
				console.log(`player ${playerId} left tournament lobby ${tournamentId}`);
				socket.close();
				tournament.sockets.delete(socket);
			}
		}

		tournament.players = tournament.players.filter(player => player.id !== playerId);

		if (tournament.players.length === 0) {
			console.log(`tournamentId ${tournamentId} empty. deleting`);
			tournamentLobbies.delete(tournamentId);
		}
		broadcastTournamentUpdate(tournamentId, tournament);
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
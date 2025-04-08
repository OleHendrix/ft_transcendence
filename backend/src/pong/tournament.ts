import { FastifyInstance } from "fastify";
import { QueueData } from "./types";

let tournamentLobbies = new Map<number, number[]>();

export async function createTournament(fastify: FastifyInstance)
{
	fastify.post('/api/create-tournament', async (request, reply) =>
	{
		const { userId, maxPlayers } = request.body as { userId: number, maxPlayers: number };

		let key;
		for (key = 0; tournamentLobbies.has(key); key++);

		// let users = new number[];
		tournamentLobbies.set(key, new )

	});
}

export async function joinTournament(fastify: FastifyInstance)
{
	fastify.post('/api/join-tournament', async (request, reply) =>
	{
		const { userId, tournamentId } = request.body as { userId: number, tournamentId: number };


	});
}
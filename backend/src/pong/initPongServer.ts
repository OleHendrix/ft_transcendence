import { initGame, updateGame, endGame } from './PongServer';
import { PongState, Match } from './types';
import { FastifyInstance } from "fastify";

let matchTable   = new Map<number, Match>([]);
let matchIDTable = new Map<number, number>([]);

export default async function initPongServer(fastify: FastifyInstance)
{
	// gets userID's match and sends it's inputs
	fastify.post('/pong', async (request, reply) =>
	{
		const { userID, keysPressed } = request.body as { userID?: number, keysPressed?: {[key: string]: boolean} };
		if (userID === undefined || keysPressed === undefined)
		{
			console.log("Undefined input:", userID, keysPressed);
			reply.status(400);
			return;
		}
		if (matchIDTable.has(userID) === false)
		{
			reply.status(400);
			return;
		}
		const key = matchIDTable.get(userID) as number;
		if (matchTable.has(key) === false)
		{
			reply.status(400);
			return;
		}
		let match = matchTable.get(key) as Match;
		updateGame(match, userID, keysPressed);
		reply.status(200).send(match.state);
	});
	
	// adds a new match between userID1 and userID2
	fastify.post('/pong/add', async (request, reply) =>
	{
		const { userID1, userID2, isLocalGame } = request.body as { userID1?: number, userID2?: number, isLocalGame?: boolean };
		if (userID1 === undefined || userID2 === undefined || isLocalGame === undefined)
		{
			reply.status(400);
			return;
		}
		let newMatch: Match = 
		{
			state:			initGame(),
			p1:				userID1,
			p2:				userID2,
			isLocalGame:	isLocalGame,
		}
		let key = 0;
		while (matchTable.has(key))
		{
			key++;
		}
		matchTable.set(key, newMatch);
		matchIDTable.set(userID1, key);
		if (userID2 !== -1)
			matchIDTable.set(userID2, key);
		reply.status(201);
	});

	fastify.post('/pong/end-game', async (request, reply) =>
	{
		const { userID } = request.body as { userID: number };
		if (userID === undefined)
		{
			reply.status(204);
			return;
		}
		if (matchIDTable.has(userID) === false)
		{
			reply.status(204);
			return;
		}
		const key = matchIDTable.get(userID) as number;
		if (matchTable.has(key) === false)
		{
			reply.status(204);
			return;
		}
		const match = matchTable.get(key) as Match;
		endGame(match, match.p1 !== userID);
		reply.status(200);
	});

	fastify.post('/pong/delete', async (request, reply) =>
	{
		const { userID } = request.body as { userID: number };
		if (userID === undefined)
		{
			reply.status(204);
			return;
		}
		if (matchIDTable.has(userID) === false)
		{
			reply.status(204);
			return;
		}
		const key = matchIDTable.get(userID) as number;
		matchIDTable.delete(userID);
		if (matchTable.has(key) === false)
		{
			reply.status(204);
			return;
		}
		const match = matchTable.get(key) as Match;
		if (matchIDTable.has(match.p1) === false && matchIDTable.has(match.p2) === false)
		{
			matchTable.delete(key);
		}
		reply.status(200);
	});
}
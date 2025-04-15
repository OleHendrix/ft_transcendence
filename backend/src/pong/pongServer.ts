// import { markAsUncloneable } from 'worker_threads';
import { initGame, updateGame, mirrorGame, endGame } from './pongLogic';
import { PlayerData, Match, Result } from './types';
import { FastifyInstance } from "fastify";
// import { match } from 'assert';

let matchTable   = new Map<number, Match>([]);
let matchIDTable = new Map<number, number>([]);

function getMatch(userID: number | undefined): Match | null
{
	// console.log("\n-----------------\n>>> GET MATCH <<<\n-----------------");
	if (userID === undefined)
	{
		console.log(">>> UID is undefined");
		return null;
	}
	if (matchIDTable.has(userID) === false)
	{
		console.log(">>> cannot find UID in MID table:", matchIDTable);
		return null;
	}
	const key = matchIDTable.get(userID) as number;
	if (matchTable.has(key) === false)
	{
		console.log(">>> cannot find MID in match table:", matchTable);
		return null;
	}
	return matchTable.get(key) as Match;
}

export function addGame(user1: PlayerData, user2: PlayerData, isLocalGame: boolean, tournament: number)
{
	let newMatch: Match = 
	{
		state:			initGame(user1, user2),
		p1:				user1,
		p2:				user2,
		isLocalGame:	isLocalGame,
		tournament:		tournament,
	}
	let key = 0;
	while (matchTable.has(key))
	{
		key++;
	}
	matchTable.set(key, newMatch);
	matchIDTable.set(user1.id, key);
	if (user2.id !== -1)
		matchIDTable.set(user2.id, key);
}

export default async function initPongServer(fastify: FastifyInstance)
{
	fastify.register( async function (fastify)
	{
		fastify.get("/pong", { websocket: true }, (connection, req) =>
		{
			connection.on("message", (message) =>
			{
				const { userID, keysPressed } = JSON.parse(message.toString());
				const match = getMatch(userID);

				if (match === null)
				{
					connection.send(400);
					return;
				}
				updateGame(match, userID, keysPressed);
				if (match.isLocalGame === false && userID === match.p2.id)
					connection.send(JSON.stringify(mirrorGame(match.state)));
				else
					connection.send(JSON.stringify(match.state));
			});
		});
	})
	
	// adds a new match between userID1 and userID2
	fastify.post('/pong/add', async (request, reply) =>
	{
		const { user1, user2, isLocalGame, tournament } = request.body as { user1?: PlayerData, user2?: PlayerData, isLocalGame?: boolean, tournament?: number };
		if (user1 === undefined || user2 === undefined || isLocalGame === undefined || tournament === undefined)
		{
			reply.status(400);
			return;
		}
		addGame(user1, user2, isLocalGame, tournament);
		reply.status(201);
	});

	fastify.post('/pong/is-local', async (request, reply) =>
	{
		const { userID } = request.body as { userID: number };
		const match = getMatch(userID);
		
		if (match === null)
		{
			reply.status(200).send(false);
			return;
		}
		reply.status(200).send(match.isLocalGame);
	});

	fastify.post('/pong/end-game', async (request, reply) =>
	{
		const { userID } = request.body as { userID: number };
		console.log("--- ending match with UID:", userID);
		const match = getMatch(userID);

		if (match === null)
		{
			reply.status(404);
			return;
		}
		endGame(match, match.p1.id === userID ? Result.P2WON : Result.P1WON);
		reply.status(200);
	});

	fastify.post('/pong/delete', async (request, reply) =>
	{
		const { userID } = request.body as { userID: number };
		console.log("--- deleting match with UID:", userID);
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
		if (match.isLocalGame === true)
		{
			console
			matchIDTable.delete(match.p1.id);
			matchIDTable.delete(match.p2.id);
		}
		else
		{
			matchIDTable.delete(userID);
		}
		if (matchIDTable.has(match.p1.id) === false && matchIDTable.has(match.p2.id) === false)
		{
			matchTable.delete(key);
		}
		reply.status(200);
	});
}
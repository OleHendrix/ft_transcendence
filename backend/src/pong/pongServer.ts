import { initGame, updateGame, endGame } from './pongLogic';
import { PlayerData, Match } from './types';
import { FastifyInstance } from "fastify";

let matchTable   = new Map<number, Match>([]);
let matchIDTable = new Map<number, number>([]);

export function addGame(user1: PlayerData, user2: PlayerData, isLocalGame: boolean)
{
	let newMatch: Match = 
	{
		state:			initGame(user1, user2),
		p1:				user1,
		p2:				user2,
		isLocalGame:	isLocalGame,
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
				
				if (userID === undefined || keysPressed === undefined)
				{
					console.log("Undefined input:", userID, keysPressed);
					connection.send(400);
					return;
				}
				if (matchIDTable.has(userID) === false)
				{
					connection.send(400);
					return;
				}
				const key = matchIDTable.get(userID) as number;
				if (matchTable.has(key) === false)
				{
					connection.send(400);
					return;
				}
				let match = matchTable.get(key) as Match;
				updateGame(match, userID, keysPressed);
				connection.send(JSON.stringify(match.state));
			});
		});
	})
	// fastify.post('/pong', async (request, reply) =>
	// {
	// 	const { userID, keysPressed } = request.body as { userID?: number, keysPressed?: {[key: string]: boolean} };
	// 	if (userID === undefined || keysPressed === undefined)
	// 	{
	// 		console.log("Undefined input:", userID, keysPressed);
	// 		reply.status(400);
	// 		return;
	// 	}
	// 	if (matchIDTable.has(userID) === false)
	// 	{
	// 		reply.status(400);
	// 		return;
	// 	}
	// 	const key = matchIDTable.get(userID) as number;
	// 	if (matchTable.has(key) === false)
	// 	{
	// 		reply.status(400);
	// 		return;
	// 	}
	// 	let match = matchTable.get(key) as Match;
	// 	updateGame(match, userID, keysPressed);
	// 	reply.status(200).send(match.state);
	// });
	
	// adds a new match between userID1 and userID2
	fastify.post('/pong/add', async (request, reply) =>
	{
		const { user1, user2, isLocalGame } = request.body as { user1?: PlayerData, user2?: PlayerData, isLocalGame?: boolean };
		if (user1 === undefined || user2 === undefined || isLocalGame === undefined)
		{
			reply.status(400);
			return;
		}
		addGame(user1, user2, isLocalGame);
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
		endGame(match, match.p1.id !== userID);
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
		if (matchTable.has(key) === false)
		{
			reply.status(204);
			return;
		}
		const match = matchTable.get(key) as Match;
		if (match.isLocalGame === true)
		{
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
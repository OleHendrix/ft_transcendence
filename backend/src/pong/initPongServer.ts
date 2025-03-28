import { postGame, deleteGame, getGame } from './PongServer';
import { PongState, Match } from './types';
import { FastifyInstance } from "fastify";

let userTable = new Map<number, Match>([]);

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
		if (userTable.has(userID) === false)
		{
			reply.status(400);
			return;
		}
		let state: PongState;
		try
		{
			state = getGame(userTable.get(userID) as Match, keysPressed);
		}
		catch (error)
		{
			reply.status(400);
			return;
		}
		reply.status(200).send(state);
	});
	
	// adds a new match between userID1 and userID2
	fastify.post('/pong/add', async (request, reply) =>
	{
		const { userID1, userID2 } = request.body as { userID1?: number, userID2?: number };
		if (userID1 === undefined || userID2 === undefined)
		{
			reply.status(400);
			return;
		}
		if (userTable.has(userID1) && (userID2 === -1 || userTable.has(userID2)))
		{
			reply.status(200);
			return;
		}
		let matchID = postGame();
		userTable.set(userID1, { ID: matchID, isPlayer1: true,  vsAI: userID2 === -1 });
		userTable.set(userID2, { ID: matchID, isPlayer1: false, vsAI: false });
		reply.status(201);
	});
	
	// deletes the match userID1 is in
	fastify.post('/pong/delete', async (request, reply) =>
	{
		const { userID1, userID2 } = request.body as { userID1: number, userID2: number };
		if (userID1 === undefined || userID2 === undefined)
		{
			reply.status(400);
			return;
		}
		try
		{
			const ID = userTable.get(userID1)?.ID; // shits the bed if userTable doenst contain userID1
			userTable.delete(userID1);
			userTable.delete(userID2); // fine because delete userTable[-1] throws no error
			deleteGame(ID as number);
		}
		catch
		{
			reply.status(404);
			return;
		}
		reply.status(200);
	});
}
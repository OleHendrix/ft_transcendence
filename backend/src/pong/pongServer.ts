// import { markAsUncloneable } from 'worker_threads';
import { initGame, updateGame, mirrorGame, endGame } from './pongLogic';
import { PlayerData, Match, Result } from '../types/types';
import { FastifyInstance } from "fastify";
// import { match } from 'assert';

let matchTable   = new Map<number, Match>([]);
let matchIDTable = new Map<number, number>([]);

function getMatch(userID: number | undefined): Match | null
{
	if (userID === undefined) return null;
	if (matchIDTable.has(userID) === false) return null;
	const key = matchIDTable.get(userID) as number;
	if (matchTable.has(key) === false) return null;
	return matchTable.get(key) ?? null;
}

export function isInGame(userID: number | undefined): boolean {
	if (!userID) return false;
	return matchIDTable.has(userID);
}

export function addGame(user1: PlayerData, user2: PlayerData, isLocalGame: boolean, tournamentId: number): number {
	let newMatch: Match = {
		state:			initGame(user1, user2),
		p1:				user1,
		p2:				user2,
		isLocalGame:	isLocalGame,
		tournamentId:	tournamentId,
	}
	let key = 1;
	while (matchTable.has(key)) {
		key++;
	}
	matchTable.set(key, newMatch);
	matchIDTable.set(user1.id, key);
	if (user2.id !== -1) {
		matchIDTable.set(user2.id, key);
	}
	return key;
}

export default async function initPongServer(fastify: FastifyInstance) {
	fastify.register( async function (fastify) {
		fastify.get("/pong", { websocket: true }, (connection, req) => {
			connection.on("message", (message) => {
				const { userID, keysPressed } = JSON.parse(message.toString());
				const match = getMatch(userID);

				if (match === null) {
					connection.send(400);
					return;
				}
				updateGame(match, userID, keysPressed);
				if (match.isLocalGame === false && userID === match.p2.id) {
					connection.send(JSON.stringify(mirrorGame(match)));
				} else {
					connection.send(JSON.stringify(match));
				}
			});
		});
	})
	
	// adds a new match between userID1 and userID2
	fastify.post('/pong/add', async (request, reply) => {
		const { user1, user2, isLocalGame, tournamentId } = request.body as { user1?: PlayerData, user2?: PlayerData, isLocalGame?: boolean, tournamentId?: number };
		if (user1 === undefined || user2 === undefined || isLocalGame === undefined || tournamentId === undefined) {
			// console.log(user1, user2, isLocalGame, tournamentId);
			return reply.status(400).send();
		}
		const key = addGame(user1, user2, isLocalGame, tournamentId);
		return reply.status(201).send();
	});

	// If the match is ongoing, it'll end the match, with userID forfeiting if it's an online game
	// The connection between userID and the match will be detached, if this was the last connection, the match will be removed
	fastify.post('/pong/delete', async (request, reply) => {
		const { userID } = request.body as { userID: number };

		if (userID === undefined)					return reply.status(204).send();
		if (matchIDTable.has(userID) === false)		return reply.status(204).send();
		const key = matchIDTable.get(userID) ?? -1;
		if (matchTable.has(key) === false)			return reply.status(204).send();
		const match = matchTable.get(key);
		if (match === undefined)					return reply.status(204).send();

		if (match.state.result === Result.PLAYING) {
			const result = match.isLocalGame === true 
				? Result.DRAW 
				: match.p1.id === userID
				? Result.P2WON
				: Result.P1WON;
			endGame(match, result);
		}
		if (match.isLocalGame === true) {
			matchIDTable.delete(match.p1.id);
			matchIDTable.delete(match.p2.id);
		} else {
			matchIDTable.delete(userID);
		}
		if (matchIDTable.has(match.p1.id) === false && matchIDTable.has(match.p2.id) === false) {
			matchTable.delete(key);
		}
		reply.status(200);
	});
}
import { FastifyInstance } from "fastify";
import { WebSocket } from "ws";
import { addGame } from "./pongServer";
import { Opponent, QueueData } from "../types/types"
import { Socket } from "dgram";

const queue = new Map<WebSocket, QueueData>();

function matchMake(socket1: WebSocket, user1: QueueData, socket2: WebSocket, user2: QueueData)
{
	const matchID = addGame(user1.player, user2.player, false, -1);
	socket1.send("Starting match");
	socket2.send("Starting match");
}

function findMatch(socket: WebSocket, user: QueueData): boolean
{
	for (const [key, value] of queue)
	{
		if (value.opponentID === Opponent.ANY || value.opponentID === user.player.id &&
			 user.opponentID === Opponent.ANY ||  user.opponentID === value.player.id)
		{
			queue.delete(key);
			matchMake(key, value, socket, user);
			return true;
		}
	};
	return false;
}

function matchVsAI(socket: WebSocket, user: QueueData)
{
	addGame(user.player, { id: -1, username: "AI👾" }, true, -1);
	socket.send("Starting match");
}

export default function initMatchMaking(fastify: FastifyInstance)
{
	fastify.register( async function (fastify)
	{
		fastify.get("/matchmake", { websocket: true }, (connection, req) =>
		{
			connection.on("message", (message) =>
			{
				const user: QueueData = JSON.parse(message.toString());
				if (user.opponentID == Opponent.AI)
				{
					matchVsAI(connection, user);
				}
				else if (findMatch(connection, user) === false)
				{
					queue.set(connection, user);
				}
			});

			connection.on("close", () =>
			{
				queue.delete(connection);
			});
		});
	})
}
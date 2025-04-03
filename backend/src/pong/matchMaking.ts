import { FastifyInstance } from "fastify";
import { WebSocket } from "ws";
import { addGame } from "./pongServer";
import { PlayerData } from "./types"

const queue = new Map<WebSocket, PlayerData>();

function matchMake()
{
	const match = Array.from(queue).slice(0, 2);
	const [socket1, user1] = match[0];
	const [socket2, user2] = match[1];

	addGame(user1, user2, false);
	socket1.send("Starting match");
	socket2.send("Starting match");
	queue.delete(socket1);
	queue.delete(socket2);
}

export default function initMatchMaking(fastify: FastifyInstance)
{
	fastify.register( async function (fastify)
	{
		console.log("init MM server");
		fastify.get("/matchmake", { websocket: true }, (connection, req) =>
		{
			console.log("Player connected");
		
			connection.on("message", (message) =>
			{
				console.log("Got input");
				const user: PlayerData = JSON.parse(message.toString());
				queue.set(connection, user);
				if (queue.size >= 2)
					matchMake()
			});
		
			connection.on("close", () =>
			{
				console.log("Player disconnected");
				queue.delete(connection);
			});
		});
	})
}
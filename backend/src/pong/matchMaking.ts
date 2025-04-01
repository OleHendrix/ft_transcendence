import { FastifyInstance } from "fastify";
import { WebSocket } from "ws";
import { addGame } from "./pongServer";

const queue = new Map<WebSocket, number>();

function matchMake()
{
	const match = Array.from(queue).slice(0, 2);
	const [socket1, userID1] = match[0];
	const [socket2, userID2] = match[1];

	addGame(userID1, userID2, false);
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
				const userID = Number(message.toString());
				queue.set(connection, userID);
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
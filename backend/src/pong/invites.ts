import { FastifyInstance } from "fastify";
import { WebSocket } from "ws";
import { addGame } from "./pongServer";
import { Opponent, QueueData } from "./types"
import { unwatchFile } from "fs";

class BiMap<K, V>
{
	private forward = new Map<K, V>();
	private reverse = new Map<V, K>();

	set(key: K, value: V)
	{
		this.forward.set(key, value);
		this.reverse.set(value, key);
	}

	getByKey(key: K): V | undefined { return this.forward.get(key); }
	getByValue(value: V): K | undefined { return this.reverse.get(value); }

	deleteByKey(key: K)
	{
		const value = this.forward.get(key);
		if (value !== undefined)
		{
			this.forward.delete(key);
			this.reverse.delete(value);
		}
	}

	deleteByValue(value: V)
	{
		const key = this.reverse.get(value);
		if (key !== undefined)
		{
			this.reverse.delete(value);
			this.forward.delete(key);
		}
	}

	hasKey(key: K): boolean { return this.forward.has(key); }
	hasValue(value: V): boolean { return this.reverse.has(value); }
}

const invites = new BiMap<number, WebSocket>();

function findSocket(msgID: number): WebSocket | undefined
{
	if (msgID === undefined) return undefined;
	return invites?.getByKey(msgID);
}

function deleteMsg(socket: WebSocket)
{
	if (socket === undefined) return undefined;
	invites.deleteByValue(socket);
}

export default function initInvite(fastify: FastifyInstance)
{
	fastify.post('/invite/accept', async (request, reply) =>
	{
		const { msgID } = request.body as { msgID: number };

		const socket = findSocket(msgID)
		if (socket === undefined) return reply.code(404).send(false);
		socket.send("Invite accepted")
		// check if user can accept
		invites.deleteByKey(msgID);
		return reply.code(200).send(true);
	});

	fastify.post('/invite/cancel', async (request, reply) =>
	{
		const { msgID } = request.body as { msgID: number };

		if (msgID === undefined) return reply.code(404).send(false);
		invites.deleteByKey(msgID);
		return reply.code(200).send(true);
	});

	fastify.register( async function (fastify)
	{
		fastify.get("/invite/send", { websocket: true }, (connection, req) =>
		{
			connection.on("message", (message) =>
			{
				const msgID: number = JSON.parse(message.toString());
				
				if (msgID === undefined) return;
				invites.set(msgID, connection);
			});

			connection.on("close", () => deleteMsg(connection));
		});
	})
}
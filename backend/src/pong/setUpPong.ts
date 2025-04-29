import { FastifyInstance } from "fastify/fastify";
import { PrismaClient } from ".prisma/client";

import initPongServer from "./pongServer";
import initMatchMaking from "./matchMaking";
import initInvite from "./invites";

export async function setupPong(fastify: FastifyInstance, prisma: PrismaClient)
{
	await initPongServer(fastify);

	initMatchMaking(fastify);
	initInvite(fastify)
}

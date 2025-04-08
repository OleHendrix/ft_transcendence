import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

import blockUser from "./blockUser";
import createWebsocket from "./createWebsocket";
import getIsBlocked from "./getIsBlocked";
import getMessages from "./getMessages";
import sendMessage from "./sendMessage";
import setMsgStatus from "./setMsgStatus";
import unblockUser from "./unblockUser";


export async function setupChat(fastify: FastifyInstance, prisma: PrismaClient) {
	await blockUser(fastify, prisma);
	await createWebsocket(fastify, prisma);
	await getIsBlocked(fastify, prisma);
	await getMessages(fastify, prisma);
	await sendMessage(fastify, prisma);
	await setMsgStatus(fastify, prisma);
	await unblockUser(fastify, prisma);
}

import { FastifyInstance } from "fastify/fastify";
import { PrismaClient } from ".prisma/client";

import setupTotp from "./setupTotp";
import verifySetupTotp from "./verifySetupTotp";
import verifyTotp from "./verifyTotp";
import deleteTotp from "./deleteTotp";

export async function setUpTwofa(fastify: FastifyInstance, prisma: PrismaClient)
{
	await setupTotp(fastify, prisma);
	await verifySetupTotp(fastify, prisma);
	await verifyTotp(fastify, prisma);
	await deleteTotp(fastify, prisma);
}
import { FastifyInstance } from "fastify/fastify";
import { PrismaClient }    from ".prisma/client";
import fastifyJwt          from '@fastify/jwt';

import authenticate from "./authenticate";
import refreshToken from "./refreshToken";


export async function setUpJwt(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.register(fastifyJwt, { secret: process.env.SECRET_KEY || "balzak"});

	await authenticate(fastify);
	await refreshToken(fastify, prisma);
}
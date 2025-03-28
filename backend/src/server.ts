import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import fastifyCors from '@fastify/cors';
import fastifyJwt from 'fastify-jwt';
import bcrypt from 'bcrypt';

import setupTotp from './auth/setupTotp';
import verifyTotp from './auth/verifyTotp';
import deleteTotp from './auth/deleteTotp';
import addAccount from './user/addAccount';
import deleteAccount from './user/deleteAccount';
import getPlayers from './user/getPlayers';
import login from './user/login';
import initPongServer from './pong/initPongServer';

const fastify = Fastify();
fastify.register(fastifyCors);
fastify.register(fastifyJwt, { secret: process.env.SECRET_KEY || "balzak"});
const prisma = new PrismaClient();

fastify.get('/', async (request, reply) =>
{
	return { message: 'Server is running!' };
});

const start = async () =>
{
	await addAccount(fastify, prisma);
	await deleteAccount(fastify, prisma);
	await getPlayers(fastify, prisma);
	await login(fastify, prisma);

	await setupTotp(fastify, prisma);
	await verifyTotp(fastify, prisma);
	await deleteTotp(fastify, prisma);

	await initPongServer(fastify);

	fastify.listen({ port: 5001, host: 'localhost' }, (err, address) =>
	{
		if (err)
		{
			console.error(err);
			process.exit(1);
		}
		console.log(`Server running at ${address}`);
	});
}

start();

import Fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import fastifyCors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

import setupTotp from './auth/setupTotp';
import verifyTotp from './auth/verifyTotp';
import deleteTotp from './auth/deleteTotp';

import addAccount from './user/addAccount';
import deleteAccount from './user/deleteAccount';
import getAccounts from './user/getAccounts';
import login from './user/login';
import logout from './user/logout'

import initPongServer from './pong/initPongServer';

import { setupChat } from './chat';

const fastify = Fastify();
export const prisma = new PrismaClient();

fastify.register(fastifyCors);
fastify.register(fastifyJwt, { secret: process.env.SECRET_KEY || "balzak"});

setupChat(fastify);

fastify.get('/', async (request, reply) =>
{
	return { message: 'Server is running!' };
});

const start = async () =>
{
	await addAccount(fastify, prisma);
	await deleteAccount(fastify, prisma);
	await getAccounts(fastify, prisma);
	await login(fastify, prisma);
	await logout(fastify, prisma);

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

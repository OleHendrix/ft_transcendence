import Fastify 			from 'fastify';
import fastifyJwt		from '@fastify/jwt';
import fastifyCors		from '@fastify/cors';
import { PrismaClient }	from '@prisma/client';
import fastifyWebsocket 	from '@fastify/websocket';

import setupTotp		from './auth/setupTotp';
import verifyTotp		from './auth/verifyTotp';
import deleteTotp		from './auth/deleteTotp';

import addAccount		from './user/addAccount';
import deleteAccount	from './user/deleteAccount';
import getAccounts		from './user/getAccounts';
import getAccount		from './user/getAccount';
import checkValidation  from './user/checkValidation';
import upload 			from './user/upload';
import login			from './user/login';
import logout			from './user/logout'
import updateAccount 	from './user/updateAccount';

import initPongServer 	from './pong/pongServer';
import initMatchMaking 	from "./pong/matchMaking"

import { setupChat } 	from './chat/chat';
import { setupTournament } from './tournament/tournament';

const fastify = Fastify();
export const prisma = new PrismaClient();

fastify.register(fastifyCors);

fastify.register(fastifyJwt, { secret: process.env.SECRET_KEY || "balzak"});
fastify.register(fastifyWebsocket, { options: { clientTracking: true }});

setupChat(fastify, prisma);
setupTournament(fastify);

fastify.get('/', async (request, reply) =>
{
	return { message: 'Server is running!' };
});

const start = async () =>
{
	await addAccount(fastify, prisma);
	await deleteAccount(fastify, prisma);
	await getAccounts(fastify, prisma);
	await getAccount(fastify, prisma);
	await upload(fastify, prisma);
	await checkValidation(fastify, prisma);
	await login(fastify, prisma);
	await logout(fastify, prisma);
	await updateAccount(fastify, prisma);

	await setupTotp(fastify, prisma);
	await verifyTotp(fastify, prisma);
	await deleteTotp(fastify, prisma);

	await initPongServer(fastify);
	
	initMatchMaking(fastify);

	fastify.listen({ port: 5001, host: '0.0.0.0' }, (err, address) =>
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
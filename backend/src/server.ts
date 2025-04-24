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
import login			from './user/login';
import logout			from './user/logout'
import updateAccount 	from './user/updateAccount';

import initPongServer 	from './pong/pongServer';
import initMatchMaking 	from "./pong/matchMaking"

import { setupChat } 	from './chat/chat';
import { setupTournament } from './tournament/tournament';
import initInvite from './pong/invites';

import authenticate from './auth/authenticate';
import verifySetupTotp from './auth/verifySetupTotp';

const fastify = Fastify();
export const prisma = new PrismaClient();

fastify.register(fastifyCors);
fastify.register(fastifyJwt, { secret: process.env.SECRET_KEY || "balzak"});
fastify.register(fastifyWebsocket, { options: { clientTracking: true }});

// fastify.register(authenticate);

// console.log("Does Fastify have authenticate?", typeof fastify.authenticate);


setupChat(fastify, prisma);
setupTournament(fastify);

fastify.get('/', async (request, reply) =>
{
	return { message: 'Server is running!' };
});

const start = async () =>
{
	await authenticate(fastify);

	await addAccount(fastify, prisma);
	await deleteAccount(fastify, prisma);
	await getAccounts(fastify, prisma);
	await getAccount(fastify, prisma);
	await checkValidation(fastify, prisma);
	await login(fastify, prisma);
	await logout(fastify, prisma);
	await updateAccount(fastify, prisma);

	await setupTotp(fastify, prisma);
	await verifySetupTotp(fastify, prisma);
	await verifyTotp(fastify, prisma);
	await deleteTotp(fastify, prisma);

	await initPongServer(fastify);

	initMatchMaking(fastify);
	initInvite(fastify)

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
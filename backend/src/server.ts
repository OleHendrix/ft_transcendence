import Fastify           from 'fastify';
import fastifyCors       from '@fastify/cors';
import { PrismaClient }  from '@prisma/client';
import fastifyWebsocket  from '@fastify/websocket';

import { setUpTwofa }       from './auth/setUpAuth';
import { setupChat }       from './chat/setUpChat';
import { setupPong }       from './pong/setUpPong';
import { setUpAccount }    from './user/setUpAccount';
import { setupTournament } from './tournament/tournament';
import { setUpJwt } from './jwt/setUpJwt';

const fastify = Fastify();
export const prisma = new PrismaClient();

fastify.register(fastifyCors);
fastify.register(fastifyWebsocket, { options: { clientTracking: true }});


// setUpJwt first for the authenticate middleWare
setUpJwt(fastify, prisma);
setUpTwofa(fastify, prisma);
setupChat(fastify, prisma);
setupPong(fastify, prisma);
setUpAccount(fastify, prisma);
setupTournament(fastify);

fastify.get('/', async (request, reply) =>
{
	return { message: 'Server is running!' };
});

fastify.listen({ port: 5001, host: '0.0.0.0' }, (err, address) =>
{
	if (err)
	{
		console.error(err);
		process.exit(1);
	}
	console.log(`Server running at ${address}`);
});
import Fastify           from 'fastify';
import fastifyJwt        from '@fastify/jwt';
import fastifyCors       from '@fastify/cors';
import { PrismaClient }  from '@prisma/client';
import fastifyWebsocket  from '@fastify/websocket';

import { setUpAuth }       from './auth/setUpAuth';
import { setupChat }       from './chat/setUpChat';
import { setupPong }       from './pong/setUpPong';
import { setUpAccount }    from './user/setUpAccount';
import { setupTournament } from './tournament/tournament';

const fastify = Fastify();
export const prisma = new PrismaClient();

fastify.register(fastifyCors, 
	{
		origin: [
			'http://localhost:5173',
			'https://ft-transcendence-three.vercel.app',
			'https://nextball.online'
		],
		credentials: true
	}
);

fastify.register(fastifyJwt, { secret: process.env.JWT_SECRET || 'balzak '});
fastify.register(fastifyWebsocket, { options: { clientTracking: true }});

setUpAuth(fastify, prisma);
setupChat(fastify, prisma);
setupPong(fastify, prisma);
setUpAccount(fastify, prisma);
setupTournament(fastify);

fastify.get('/', async (request, reply) =>
{
	return { message: 'Server is running!' };
});

fastify.listen({ port: Number(process.env.PORT || 5001), host: '0.0.0.0' }, (err, address) =>
{
	if (err)
	{
		console.error(err);
		process.exit(1);
	}
	console.log(`Server running at ${address}`);
});
// start();
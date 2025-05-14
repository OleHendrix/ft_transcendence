import Fastify           from 'fastify';
import fastifyCors       from '@fastify/cors';
import { PrismaClient }  from '@prisma/client';
import fastifyWebsocket  from '@fastify/websocket';

import fs from 'fs';
import path from 'path';

import { setUpTwofa }       from './auth/setUpAuth';
import { setupChat }       from './chat/setUpChat';
import { setupPong }       from './pong/setUpPong';
import { setUpAccount }    from './account/setUpAccount';
import { setupTournament } from './tournament/tournament';
import { setUpJwt } from './jwt/setUpJwt';

import os from 'os';

function getLocalIP(): string | null
{
	const interfaces = os.networkInterfaces();
	for (const name in interfaces)
	{
		for (const iface of interfaces[name] || [])
		{
			if (iface.family === 'IPv4' && !iface.internal)
			{
				return iface.address;
			}
		}
	}
	return null;
}

const localIP = getLocalIP();

const fastify = Fastify({
	https:
	{
		key:  fs.readFileSync(path.join(__dirname, '../ssl/key.pem')),
		cert: fs.readFileSync(path.join(__dirname, '../ssl/cert.pem')),
	}
});


const allowedOrigins = new Set([
	`https://localhost:5173`,
	localIP ? `https://${localIP}:5173` : null,
  ]);
  
  fastify.register(fastifyCors, {
	origin: (origin, cb) => {
		if (!origin || allowedOrigins.has(origin)) {
			cb(null, true);
		} else {
			console.warn(`Blocked CORS request from origin: ${origin}`);
			cb(new Error("Not allowed by CORS"), false);
		}
	},
	credentials: true,
});
fastify.register(fastifyWebsocket, { options: { clientTracking: true }});

export const prisma = new PrismaClient();

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

fastify.listen({ port: Number(process.env.PORT || 5001), host: '0.0.0.0' }, (err, address) =>
{
	if (err)
	{
		console.error(err);
		process.exit(1);
	}
	console.log(`Server listening on:`);
	console.log(`→ Localhost: https://localhost:5001`);
	if (localIP) {
		console.log(`→ LAN:      https://${localIP}:5001`);
  }
});
// start();
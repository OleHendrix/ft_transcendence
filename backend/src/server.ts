import Fastify           from 'fastify';
import fastifyCors       from '@fastify/cors';
import { PrismaClient }  from '@prisma/client';
import fastifyWebsocket  from '@fastify/websocket';

import fs from 'fs';
import path from 'path';

import { setUpJwt }        from './jwt/setUpJwt';
import { setUpTwofa }      from './auth/setUpAuth';
import { setupChat }       from './chat/setUpChat';
import { setupPong }       from './pong/setUpPong';
import { setUpAccount }    from './account/setUpAccount';
import { setupTournament } from './tournament/tournament';

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
export const prisma = new PrismaClient();



fastify.register(fastifyCors,
{
	origin: (origin, cb) => {
		// Allow if:
		// - No origin (e.g., curl or same-origin)
		// - Origin matches our frontend on LAN
		const allowedOrigins = [
		`https://${localIP}:5173`,
		`https://localhost:5173`,
		];

		if (!origin || allowedOrigins.includes(origin)) {
		cb(null, true);
		} else {
		cb(new Error("CORS not allowed"), false);
		}
	},
	credentials: true
});

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
		console.log(`→ LAN:       https://${localIP}:5001`);
  }
});
// start();
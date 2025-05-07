import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import cleanup from './cleanup'; 
import bcrypt from 'bcrypt';

export async function createLoginWebsocket(server: FastifyInstance, prisma: PrismaClient)
{
	server.register(async function (server)
	{
		server.get("/ws/login", { websocket: true }, (connection, req) =>
		{
			console.log("LOGIN SOCKET CONNECTED");
			const userIdstring = req.query as { userId: string};
			const userId = parseInt(userIdstring.userId, 10)

			connection.on("close", () => cleanup(userId));
		})
	})
}


export default async function login(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/login', async (request, reply) =>
	{
		const { username, password } = request.body as { username: string; password: string };
	
		const account = await prisma.account.findUnique({ where: { username } });
		if (!account) return reply.status(400).send({ error: 'Username not found' })
		
		const validPassword = await bcrypt.compare(password, account.password);
		if (!validPassword) return reply.status(401).send({ error: 'Password incorrect'});

		if (account.online)
			reply.status(402).send({ error: 'Already logged in'})

		if (account.twofa)
		{
			console.log('needs 2fa');
			const tempToken = fastify.jwt.sign({
				sub: account.id,
				username: account.username,
				email: account.email,
				twofaRequired: true,
			},
			{ expiresIn: '5m' });
			return reply.send({ success: false, token: tempToken, twofaRequired: true });
		}

		await prisma.account.update ({
				where: { username },
				data:  { online: true }
		});

		if (account.avatar && account.avatar !== '')
		{
			// const hostUrl = `${req.protocol}://${req.hostname}`;
			account.avatar = `${process.env.BACKEND_URL}${account.avatar}`;
		}
		const finalToken = fastify.jwt.sign({
			sub: account.id,
			username: account.username,
			email: account.email,
			twofaRequired: true,
		},
		{ expiresIn: '15m' });

		const refreshToken = fastify.jwt.sign({
			sub: account.id,
		},
		{ expiresIn: '7d' });

		reply.send({ success: true, token: finalToken, refreshToken, account });
	});
}
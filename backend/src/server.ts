import Fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import fastifyCors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import setupTotp from './authenticator/setupTotp';
import verifyTotp from './authenticator/verifyTotp';
import { setupChat } from './chat';

const fastify = Fastify();
const prisma = new PrismaClient();

fastify.register(fastifyCors);
fastify.register(fastifyJwt, { secret: process.env.SECRET_KEY || "balzak"});

setupChat(fastify);

interface AddAccountRequest
{
	username: string;
	email: string;
	password: string;
}

fastify.get('/', async (request, reply) => {
	return { message: 'Server is running!' };
});

fastify.post('/api/addaccount', async (request, reply) =>
{
	const { username, email, password } = request.body as AddAccountRequest;
	const hashedPassword = await bcrypt.hash(password, 10);
	const existingAccount = await prisma.account.findFirst({
		where: {
			OR: [ { username: username }, { email: email } ]
		}
	});

	if (existingAccount) {
		if (existingAccount.username === username)
			return reply.status(400).send({ error: 'Username already exists' });
		if (existingAccount.email === email)
			return reply.status(400).send({ error: 'Email already exists' });
		return reply.status(500).send({ error: 'Something went wrong' });
	}

	const newAccount = await prisma.account.create({
		data: {
			username: username,
			email: email,
			password: hashedPassword,
			wins: 0,
			draws: 0,
			loses: 0
		}
	});
	return reply.send({ success: true, account: newAccount });
});

fastify.post("/api/login", async (req, res) => {
	const { username, password } = req.body as { username: string; password: string };

	const user = await prisma.account.findUnique({ where: { username } });
	if (!user) return res.status(400).send({ eror: "User not found" })

	const validPassword = await bcrypt.compare(password, user.password);
	if (!validPassword) return res.status(401).send({ error: "Incorrect password"});

	const token = fastify.jwt.sign({ username: user.username, email: user.email}, { expiresIn: "1h"});
	res.send({ success: true, token, user});
});


fastify.get('/api/get-accounts', async (request, reply) => { //change so it dont fetch passwords
	try {
		const accounts = await prisma.account.findMany();
		return reply.send({ success: true, accounts });
	} catch (error) {
		return reply.status(500).send({ error: 'Error getting accounts from database' });
	}
});

const start = async () =>
{
	await setupTotp(fastify);
	await verifyTotp(fastify);

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

export default prisma
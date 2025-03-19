import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import fastifyCors from '@fastify/cors';
import fastifyJwt from 'fastify-jwt';
import bcrypt from 'bcrypt';
// import dotenv from 'dotenv';

const fastify = Fastify();
fastify.register(fastifyCors);
fastify.register(fastifyJwt, { secret: process.env.SECRET_KEY || "balzak"});
const prisma = new PrismaClient();

interface AddAccountRequest
{
	username: string;
	email: string;
	password: string;
}

fastify.get('/', async (request, reply) =>
{
  return { message: 'Server is running!' };
});

fastify.post('/api/addaccount', async (request, reply) =>
{
	const { username, email, password }: AddAccountRequest = request.body as AddAccountRequest;
	const hashedPassword = await bcrypt.hash(password, 10);
	const existingAccount = await prisma.account.findFirst(
	{
    	where:
		{
      		OR: [ { username: username }, { email: email } ]
		}
	});
	
	if (existingAccount)
	{
    	if (existingAccount.username === username)
			return reply.status(400).send({ error: 'Username already exists' });
		if (existingAccount.email === email)
      		return reply.status(400).send({ error: 'Email already exists' });
	}
	
	const newAccount = await prisma.account.create(
	{
		data:
		{
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
	if (!user) 
		return res.status(400).send({ eror: "User not found" })
	
	const validPassword = await bcrypt.compare(password, user.password);
	if (!validPassword) 
		return res.status(401).send({ error: "Incorrect password"});

	const token = fastify.jwt.sign({ username: user.username, email: user.email}, { expiresIn: "1h"});
	res.send({ success: true, token, user});
});


fastify.get('/api/getplayers', async (request, reply) => 
{
	try
	{
		const players = await prisma.account.findMany();
		return reply.send({ success: true, players });
	}
	catch (error)
	{
		return reply.status(500).send({ error: 'Error getting players from database' });
	}
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

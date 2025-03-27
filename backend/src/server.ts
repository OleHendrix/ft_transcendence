import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import fastifyCors from '@fastify/cors';
import fastifyJwt from 'fastify-jwt';
import bcrypt from 'bcrypt';
import { postGame, deleteGame, getGame } from './PongServer';
import { error } from 'console';
import { PongState, Match } from '../../frontend/src/types';
// import dotenv from 'dotenv';
// import { PongState } from './../../frontend/src/types'

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



let userTable = new Map<number, Match>([]);

// gets userID's match and sends it's inputs
// TODO: add input
fastify.post('/pong', async (request, reply) =>
{
	const { userID, keysPressed } = request.body as { userID?: number, keysPressed?: {[key: string]: boolean} };
	if (userID === undefined || keysPressed === undefined)
	{
		console.log("Undefined input:", userID, keysPressed);
		reply.status(400);
		return;
	}
	// console.log("keys pressed:", keysPressed);
	//console.log("Detected user:", userID);
	if (userTable.has(userID) === false)
	{
		//console.log("User not in table:", userTable);
		reply.status(400);
		return;
	}
	let state: PongState;
	try
	{
		//console.log("UserID:", userTable.get(userID)?.ID as number);
		state = getGame(userTable.get(userID) as Match, keysPressed);
	}
	catch (error)
	{
		//console.log("Caught error:", error);
		reply.status(400);
		return;
	}
	//console.log(state);
	reply.status(200).send(state);
});

// adds a new match between userID1 and userID2
fastify.post('/pong/add', async (request, reply) =>
{
	const { userID1, userID2 } = request.body as { userID1?: number, userID2?: number };
	//console.log("adding game with:", userID1, userID2);
	if (userID1 === undefined || userID2 === undefined)
	{
		//console.log("User undefined");
		reply.status(400);
		return;
	}
	if (userTable.has(userID1) && (userID2 === -1 || userTable.has(userID2)))
	{
		//console.log("User already in table");
		reply.status(200);
		return;
	}
	let matchID = postGame();
	userTable.set(userID1, { ID: matchID, isPlayer1: true,  vsAI: userID2 === -1 });
	userTable.set(userID2, { ID: matchID, isPlayer1: false, vsAI: false });
	reply.status(201);
});

// deletes the match userID1 is in
fastify.post('/pong/delete', async (request, reply) =>
{
	const { userID1, userID2 } = request.body as { userID1: number, userID2: number };
	if (userID1 === undefined || userID2 === undefined)
	{
		//console.log("User undefined");
		reply.status(400);
		return;
	}
	try
	{
		const ID = userTable.get(userID1)?.ID;
		userTable.delete(userID1);
		userTable.delete(userID2); // fine because delete userTable[-1] throws no error
		deleteGame(ID as number);
	}
	catch
	{
		//console.log("Caught error:", error);
		reply.status(404);
		return;
	}
	reply.status(200);
});

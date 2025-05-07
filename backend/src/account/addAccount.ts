import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

interface AddAccountRequest
{
	username: string;
	email: string;
	password: string;
}

export default async function addAccount(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/add-account', async (request, reply) =>
	{
		const { username, email, password }: AddAccountRequest = request.body as AddAccountRequest;
		const hashedPassword  = await bcrypt.hash(password, 10);
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
				password: hashedPassword
			}
		});
		return reply.send({ success: true, account: newAccount });
	});
}
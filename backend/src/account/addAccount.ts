import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';
import { checkLoginData } from "./checkValidation";
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
		
		const check = await checkLoginData(prisma, username, email, existingAccount?.username, existingAccount?.email);
		if (check !== null)
		{
			return reply.status(400).send({ error: check });
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
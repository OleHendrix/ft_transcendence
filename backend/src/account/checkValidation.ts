import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';

function hasInvalidCharacters(str: string): boolean
{
	const forbiddenChars = /['";:\\\-/*<>&/=(){}\[\]\s]/;

	let isInvalid = forbiddenChars.test(str);
	console.log("isInvalid:", isInvalid);
	return isInvalid;
}
	
export async function checkLoginData(prisma: PrismaClient, username: string, email: string, prevUsername?: string, prevEmail?: string): Promise<string | null>
{
	if (hasInvalidCharacters(username))
		return 'Username contains forbidden characters';
	if (hasInvalidCharacters(email))
		return 'Email contains forbidden characters';

	if (prevUsername)
	{
		const usernameExist = await prisma.account.findUnique({ where: { username } });
		if (usernameExist !== null && usernameExist.username !== prevUsername)
			return 'Username already exists';
	}

	if (prevEmail)
	{
		const emailExist = await prisma.account.findUnique({ where: { email } });
		if (emailExist !== null && emailExist.email !== prevEmail)
			return 'Email already exists';
	}

	return null
}

export default async function checkValidation(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/check-validation', async (req, reply) =>
	{
		const { username, email, prevUsername, prevEmail } = req.body as
		{
			username: string,
			email: string,
			prevUsername?: string,
			prevEmail?: string
		};

		const check = checkLoginData(prisma, username, email, prevUsername, prevEmail)
		if (check === null)
			return reply.status(200).send({ success: true});
		return reply.status(200).send({ success: false, type: check });
	});
}
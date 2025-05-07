import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';

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

		const usernameExist = await prisma.account.findUnique({ where: { username } });

		if (usernameExist !== null && usernameExist.username !== prevUsername)
			return reply.status(200).send({ success: false, type: 'Username exists' });

		const emailExist = await prisma.account.findUnique({ where: { email } });

		if (emailExist !== null && emailExist.email !== prevEmail)
			return reply.status(200).send({ success: false, type: 'Email exists' });

		return reply.status(200).send({ success: true });
	});
}
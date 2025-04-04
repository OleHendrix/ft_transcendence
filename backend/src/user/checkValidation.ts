import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';

export default async function checkValidation(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/check-validation', async (req, reply) =>
	{
		const { username, email } = req.body as { username: string, email: string };

		const usernameExist = await prisma.account.findUnique({ where: { username } });

		if (usernameExist !== null)
			return reply.status(200).send({ success: false, type: 'Username exists' });

		const emailExist = await prisma.account.findUnique({ where: { email } });

		if (emailExist !== null)
			return reply.status(200).send({ success: false, type: 'Email exists' });

		
		return reply.status(200).send({ success: true });
	});
}
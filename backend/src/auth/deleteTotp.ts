import { FastifyInstance } from "fastify";
import { PrismaClient } from '@prisma/client';

export default async function deleteTotp(fastify: FastifyInstance, prisma: PrismaClient)
{
	fastify.post('/api/auth/delete-totp', async (req, reply) =>
	{
		const { username } = req.body as { username: string };
		const account = await prisma.account.findUnique({ where: { username } });

		if (!account)
			return reply.status(404).send({ error: 'User not found' });

		const updatedAccount = await prisma.account.update(
		{
			where: { username },
			data:
			{
				totpSecret: null,
				twofa: false
			}
		});

		return reply.send({ success: true, user: updatedAccount});
	});
}